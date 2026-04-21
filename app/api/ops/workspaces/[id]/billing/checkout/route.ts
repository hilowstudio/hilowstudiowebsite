import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import {
  getStripe,
  platformOrigin,
  priceIdForPlan,
  type PaidPlanSlug,
} from "@/lib/ops/stripe";

const PAID_PLANS: PaidPlanSlug[] = ["starter", "growth"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "owner", user.isPlatformAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    plan?: PaidPlanSlug;
  };
  if (!body.plan || !PAID_PLANS.includes(body.plan)) {
    return NextResponse.json(
      { error: `plan must be one of ${PAID_PLANS.join(", ")}` },
      { status: 400 },
    );
  }

  const { data: workspaceRow } = await supabase
    .from("ops_workspaces")
    .select("id, slug, billing_email")
    .eq("id", id)
    .maybeSingle();
  const workspace = workspaceRow as {
    id: string;
    slug: string;
    billing_email: string | null;
  } | null;
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const { data: subRow } = await supabase
    .from("ops_subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", id)
    .maybeSingle();
  const existingCustomer = (subRow as {
    stripe_customer_id: string | null;
  } | null)?.stripe_customer_id;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceIdForPlan(body.plan), quantity: 1 }],
      customer: existingCustomer || undefined,
      customer_email: existingCustomer
        ? undefined
        : workspace.billing_email || user.email,
      success_url: `${platformOrigin()}/w/${workspace.slug}/settings?billing=success`,
      cancel_url: `${platformOrigin()}/w/${workspace.slug}/settings?billing=cancelled`,
      metadata: {
        workspace_id: workspace.id,
        plan_slug: body.plan,
      },
      subscription_data: {
        metadata: {
          workspace_id: workspace.id,
          plan_slug: body.plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe checkout failed" },
      { status: 502 },
    );
  }
}
