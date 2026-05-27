// POST /api/sitebrain/stripe/webhook
// Validates Stripe signature and handles license lifecycle events.
//
// Env vars required:
//   STRIPE_SECRET_KEY          — Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET      — Webhook signing secret (whsec_...)
//   SB_PRICE_PRO               — Stripe Price ID for Pro plan
//   SB_PRICE_STUDIO            — Stripe Price ID for Studio plan
//   SB_PRICE_AGENCY            — Stripe Price ID for Agency plan
//   ADMIN_EMAIL                — email address to receive license delivery copies

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
  [process.env.SB_PRICE_PRO    ?? ""]: "pro",
  [process.env.SB_PRICE_STUDIO ?? ""]: "studio",
  [process.env.SB_PRICE_AGENCY ?? ""]: "agency",
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
  // Stripe SDK v22: `current_period_end` is on the subscription items or the
  // subscription itself depending on the billing model. Cast via unknown to
  // handle the evolving Stripe type definitions.
  const raw = (sub as unknown as Record<string, unknown>)["current_period_end"];
  if (typeof raw === "number") return new Date(raw * 1000);
  // Fallback: 1 year from now.
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  // Stripe SDK v22 restructured Invoice: subscription may live in
  // invoice.parent.subscription_details or directly on the object.
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
  if (session.mode !== "subscription") return;

  const email =
    session.customer_details?.email ??
    (session as unknown as Record<string, unknown>)["customer_email"] as string ?? "";

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

  await sendLicenseEmail(email, license.license_key, tier);
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

  await sendLicenseEmail(email, license.license_key, tier);
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
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "mat.pizzi@gmail.com";
  const tierLabel: Record<LicenseTier, string> = { pro: "Pro", studio: "Studio", agency: "Agency" };
  const label = tierLabel[tier];

  console.info("[SiteBrain license delivery]", {
    to,
    licenseKey,
    tier,
    message: [
      `SiteBrain AI ${label} — la tua licenza`,
      `Chiave: ${licenseKey}`,
      `Incollala in Dashboard → SiteBrain AI → Impostazioni → Licenza`,
      `Supporto: ${adminEmail}`,
    ].join(" | "),
  });
}
