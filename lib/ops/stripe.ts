import Stripe from "stripe";

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY env var");
  _client = new Stripe(key);
  return _client;
}

export type PaidPlanSlug = "starter" | "growth";

export function priceIdForPlan(slug: PaidPlanSlug): string {
  const env =
    slug === "starter"
      ? process.env.STRIPE_PRICE_STARTER
      : process.env.STRIPE_PRICE_GROWTH;
  if (!env) {
    throw new Error(`STRIPE_PRICE_${slug.toUpperCase()} env var not set`);
  }
  return env;
}

export function planSlugFromPriceId(priceId: string): string | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  return null;
}

export function mapStripeStatusToWorkspacePlan(
  stripeStatus: string,
  plan: string,
): string {
  if (stripeStatus === "active" || stripeStatus === "trialing") return plan;
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") return plan;
  // canceled, incomplete_expired, paused → fall back to free
  return "free";
}

export function platformOrigin(): string {
  return (
    process.env.OPS_PUBLIC_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://hilowstudio.dev"
  );
}
