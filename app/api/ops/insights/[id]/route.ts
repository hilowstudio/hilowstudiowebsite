import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

const ALLOWED_FIELDS = ["status", "assigned_to_user_id"];

async function loadInsight(id: string) {
  const { data } = await supabase
    .from("ops_meeting_insights")
    .select("id, meeting_id, ops_meetings!inner(client_id, ops_clients!inner(workspace_id))")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    meeting_id: string;
    ops_meetings: {
      client_id: string;
      ops_clients: { workspace_id: string } | null;
    } | null;
  };
  const clientId = row.ops_meetings?.client_id;
  const workspaceId = row.ops_meetings?.ops_clients?.workspace_id;
  if (!clientId || !workspaceId) return null;
  return { id: row.id, clientId, workspaceId };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const insight = await loadInsight(id);
  if (!insight)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      insight.clientId,
      insight.workspaceId,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ops_meeting_insights")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
