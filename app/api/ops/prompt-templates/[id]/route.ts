import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

const ALLOWED_FIELDS = [
  "label",
  "description",
  "prompt_body",
  "category",
  "sort_order",
];

async function loadRow(id: string) {
  const { data } = await supabase
    .from("ops_prompt_templates")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  return data as { id: string; workspace_id: string | null } | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await loadRow(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!row.workspace_id) {
    return NextResponse.json(
      { error: "Platform templates are read-only" },
      { status: 403 },
    );
  }
  if (!hasWorkspaceAccess(user.memberships, row.workspace_id, "staff", user.isPlatformAdmin)) {
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
    .from("ops_prompt_templates")
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
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!row.workspace_id) {
    return NextResponse.json(
      { error: "Platform templates cannot be deleted from the UI" },
      { status: 403 },
    );
  }
  if (!hasWorkspaceAccess(user.memberships, row.workspace_id, "staff", user.isPlatformAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase
    .from("ops_prompt_templates")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
