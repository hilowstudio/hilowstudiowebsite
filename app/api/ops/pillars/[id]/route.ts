import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess, hasWorkspaceAccess } from "@/lib/ops/scope";
import type { OpsUser } from "@/lib/ops/scope";

const ALLOWED_FIELDS = [
  "label",
  "short_label",
  "description",
  "funnel_role",
  "color_class",
  "sort_order",
];

async function loadRow(id: string) {
  const { data } = await supabase
    .from("content_pillars")
    .select("id, client_id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  return data as {
    id: string;
    client_id: string | null;
    workspace_id: string | null;
  } | null;
}

function canEditPillar(
  user: OpsUser,
  row: { client_id: string | null; workspace_id: string },
): boolean {
  if (user.isPlatformAdmin) return true;
  if (row.client_id) {
    return hasClientAccess(
      user.memberships,
      row.client_id,
      row.workspace_id,
      "client_contributor",
      false,
    );
  }
  return hasWorkspaceAccess(user.memberships, row.workspace_id, "staff", false);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await loadRow(id);
  if (!row || !row.workspace_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEditPillar(user, { client_id: row.client_id, workspace_id: row.workspace_id })) {
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
    .from("content_pillars")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await loadRow(id);
  if (!row || !row.workspace_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEditPillar(user, { client_id: row.client_id, workspace_id: row.workspace_id })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("content_pillars").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
