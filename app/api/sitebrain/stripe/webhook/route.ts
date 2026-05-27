// POST /api/sitebrain/stripe/webhook
// Validates Stripe signature and handles license lifecycle events.
//
// Env vars required:
//   STRIPE_SECRET_KEY                — Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET            — Webhook signing secret (whsec_...)
//   SB_PRICE_PRO                     — Stripe Price ID for Pro annual (USD)
//   SB_PRICE_STUDIO                  — Stripe Price ID for Studio annual (USD)
//   SB_PRICE_AGENCY                  — Stripe Price ID for Agency annual (USD)
//   SB_PRICE_PRO_EUR                 — Stripe Price ID for Pro annual (EUR)
//   SB_PRICE_STUDIO_EUR              — Stripe Price ID for Studio annual (EUR)
//   SB_PRICE_AGENCY_EUR              — Stripe Price ID for Agency annual (EUR)
//   SB_PRICE_PRO_LIFETIME            — Stripe Price ID for Pro lifetime (USD)
//   SB_PRICE_STUDIO_LIFETIME         — Stripe Price ID for Studio lifetime (USD)
//   SB_PRICE_AGENCY_LIFETIME         — Stripe Price ID for Agency lifetime (USD)
//   SB_PRICE_PRO_LIFETIME_EUR        — Stripe Price ID for Pro lifetime (EUR)
//   SB_PRICE_STUDIO_LIFETIME_EUR     — Stripe Price ID for Studio lifetime (EUR)
//   SB_PRICE_AGENCY_LIFETIME_EUR     — Stripe Price ID for Agency lifetime (EUR)
//   ADMIN_EMAIL                      — email address to receive license delivery copies

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createLicense,
  findBySubscription,
  extendExpiry,
  updateStatus,
  disableBySubscription,
  type LicenseTier,
} from "@/lib/sitebrain-license";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PRICE_TO_TIER: Record<string, LicenseTier> = {
  // Annual USD
  [process.env.SB_PRICE_PRO             ?? ""]: "pro",
  [process.env.SB_PRICE_STUDIO          ?? ""]: "studio",
  [process.env.SB_PRICE_AGENCY          ?? ""]: "agency",
  // Annual EUR
  [process.env.SB_PRICE_PRO_EUR         ?? ""]: "pro",
  [process.env.SB_PRICE_STUDIO_EUR      ?? ""]: "studio",
  [process.env.SB_PRICE_AGENCY_EUR      ?? ""]: "agency",
  // Lifetime USD
  [process.env.SB_PRICE_PRO_LIFETIME    ?? ""]: "pro",
  [process.env.SB_PRICE_STUDIO_LIFETIME ?? ""]: "studio",
  [process.env.SB_PRICE_AGENCY_LIFETIME ?? ""]: "agency",
  // Lifetime EUR
  [process.env.SB_PRICE_PRO_LIFETIME_EUR    ?? ""]: "pro",
  [process.env.SB_PRICE_STUDIO_LIFETIME_EUR ?? ""]: "studio",
  [process.env.SB_PRICE_AGENCY_LIFETIME_EUR ?? ""]: "agency",
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[SiteBrain webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature invalid." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err) {
    console.error(`[SiteBrain webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSubscriptionExpiry(sub: Stripe.Subscription): Date {
  const raw = (sub as unknown as Record<string, unknown>)["current_period_end"];
  if (typeof raw === "number") return new Date(raw * 1000);
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as Record<string, unknown>)["subscription"];
  if (typeof direct === "string") return direct;
  if (direct && typeof (direct as Record<string, unknown>)["id"] === "string") {
    return (direct as Record<string, unknown>)["id"] as string;
  }
  const parent = (invoice as unknown as Record<string, unknown>)["parent"] as
    | Record<string, unknown>
    | undefined;
  const subDetails = parent?.["subscription_details"] as
    | Record<string, unknown>
    | undefined;
  const fromParent = subDetails?.["subscription"];
  if (typeof fromParent === "string") return fromParent;
  return null;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email =
    session.customer_details?.email ??
    (session as unknown as Record<string, unknown>)["customer_email"] as string ?? "";

  if (session.mode === "subscription") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id ?? "";
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id ?? "";

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id ?? "";
    const tier = PRICE_TO_TIER[priceId];

    if (!tier) {
      console.error(`[SiteBrain webhook] Unknown price ID: ${priceId}`);
      return;
    }

    const existing = await findBySubscription(subscriptionId);
    if (existing) return;

    const expiresAt = getSubscriptionExpiry(subscription);
    const license = await createLicense({
      tier,
      customerEmail: email,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      expiresAt,
    });

    await sendLicenseEmail(email, license.license_key, tier, "annual");

  } else if (session.mode === "payment") {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const priceId = lineItems.data[0]?.price?.id ?? "";
    const tier = PRICE_TO_TIER[priceId];

    if (!tier) {
      console.error(`[SiteBrain webhook] Unknown lifetime price ID: ${priceId}`);
      return;
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id ?? undefined;

    const license = await createLicense({
      tier,
      customerEmail: email,
      stripeCustomerId: customerId,
      // no subscription, no expiry → lifetime
    });

    await sendLicenseEmail(email, license.license_key, tier, "lifetime");
  }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await findBySubscription(subscription.id);
  if (existing) return;

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const tier = PRICE_TO_TIER[priceId];
  if (!tier) return;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer as Stripe.Customer).id;
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
  const email = customer.email ?? "";

  const expiresAt = getSubscriptionExpiry(subscription);
  const license = await createLicense({
    tier,
    customerEmail: email,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    expiresAt,
  });

  await sendLicenseEmail(email, license.license_key, tier, "annual");
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const license = await findBySubscription(subscriptionId);
  if (!license) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await extendExpiry(license.id, getSubscriptionExpiry(subscription));
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const license = await findBySubscription(subscriptionId);
  if (!license) return;

  await updateStatus(license.id, "suspended");
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  await disableBySubscription(subscription.id);
}

// ─── Email (TODO: replace with Resend or similar) ─────────────────────────────

async function sendLicenseEmail(
  to: string,
  licenseKey: string,
  tier: LicenseTier,
  type: "annual" | "lifetime",
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "mat.pizzi@gmail.com";
  const tierLabel: Record<LicenseTier, string> = { pro: "Pro", studio: "Studio", agency: "Agency" };
  const label = tierLabel[tier];

  console.info("[SiteBrain license delivery]", {
    to,
    licenseKey,
    tier,
    type,
    message: [
      `SiteBrain AI ${label} ${type === "lifetime" ? "Lifetime" : "Annual"} — la tua licenza`,
      `Chiave: ${licenseKey}`,
      `Incollala in Dashboard → SiteBrain AI → Impostazioni → Licenza`,
      `Supporto: ${adminEmail}`,
    ].join(" | "),
  });
}
