import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

const ALLOWED_STATUSES = ["draft", "approved", "sent", "dismissed"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data } = await supabase
    .from("ops_outreach_drafts")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const row = data as { id: string; workspace_id: string } | null;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasWorkspaceAccess(
      user.memberships,
      row.workspace_id,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    draft_body?: string;
  };

  const updates: Record<string, unknown> = {};
  if (body.status && ALLOWED_STATUSES.includes(body.status)) {
    updates.status = body.status;
  }
  if (typeof body.draft_body === "string") {
    updates.draft_body = body.draft_body;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("ops_outreach_drafts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(updated);
}
