import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { getStripe, platformOrigin } from "@/lib/ops/stripe";

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

  const { data: wsRow } = await supabase
    .from("ops_workspaces")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const workspaceSlug = (wsRow as { slug: string } | null)?.slug;
  if (!workspaceSlug) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const { data: subRow } = await supabase
    .from("ops_subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", id)
    .maybeSingle();
  const customerId = (subRow as { stripe_customer_id: string | null } | null)
    ?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file yet. Subscribe first." },
      { status: 400 },
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${platformOrigin()}/w/${workspaceSlug}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portal failed" },
      { status: 502 },
    );
  }
}
