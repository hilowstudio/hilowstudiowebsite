import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import {
  getStripe,
  mapStripeStatusToWorkspacePlan,
  planSlugFromPriceId,
} from "@/lib/ops/stripe";

export const runtime = "nodejs";

async function applySubscription(subscription: Stripe.Subscription) {
  const workspaceId =
    (subscription.metadata?.workspace_id as string | undefined) ??
    (subscription.metadata?.workspaceId as string | undefined);
  if (!workspaceId) return;

  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const planFromPrice = priceId ? planSlugFromPriceId(priceId) : null;
  const planSlug = planFromPrice ?? (subscription.metadata?.plan_slug as string | undefined) ?? "starter";

  const mapped = mapStripeStatusToWorkspacePlan(subscription.status, planSlug);

  type StripeSubscriptionWithPeriod = Stripe.Subscription & {
    current_period_end?: number;
  };
  const periodEnd = (subscription as StripeSubscriptionWithPeriod).current_period_end;
  const currentPeriodEnd = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  await supabase.from("ops_subscriptions").upsert(
    {
      workspace_id: workspaceId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_slug: planSlug,
      status: subscription.status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    },
    { onConflict: "workspace_id" },
  );

  await supabase
    .from("ops_workspaces")
    .update({ plan: mapped })
    .eq("id", workspaceId);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (subId) {
          const full = await getStripe().subscriptions.retrieve(subId);
          await applySubscription(full);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
