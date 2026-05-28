// POST /api/sitebrain/stripe/checkout
// Body: { priceId: string }
// Returns: { url: string } — Stripe Checkout Session URL to redirect to.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy");

const LIFETIME_PRICE_IDS = new Set(
  [
    process.env.SB_PRICE_PRO_LIFETIME,
    process.env.SB_PRICE_STUDIO_LIFETIME,
    process.env.SB_PRICE_AGENCY_LIFETIME,
    process.env.SB_PRICE_PRO_LIFETIME_EUR,
    process.env.SB_PRICE_STUDIO_LIFETIME_EUR,
    process.env.SB_PRICE_AGENCY_LIFETIME_EUR,
  ].filter((id): id is string => typeof id === "string" && id.startsWith("price_")),
);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { priceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { priceId } = body;
  if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
    return NextResponse.json({ error: "Missing or invalid priceId." }, { status: 400 });
  }

  const isLifetime = LIFETIME_PRICE_IDS.has(priceId);
  const mode: Stripe.Checkout.SessionCreateParams["mode"] = isLifetime
    ? "payment"
    : "subscription";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fosforonero.com";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/sitebrain/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/sitebrain#pricing`,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    ...(isLifetime && { customer_creation: "always" }),
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(params);
  } catch (err) {
    console.error("[SiteBrain checkout] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }

  if (!session.url) {
    return NextResponse.json({ error: "No checkout URL returned." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
