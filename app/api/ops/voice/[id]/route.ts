import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

async function loadRow(id: string) {
  const { data } = await supabase
    .from("voice_guide")
    .select("id, client_id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  return data as {
    id: string;
    client_id: string | null;
    workspace_id: string | null;
  } | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await loadRow(id);
  if (!row || !row.client_id || !row.workspace_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (
    !hasClientAccess(
      user.memberships,
      row.client_id,
      row.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if ("content" in body) updates.content = body.content;
  if ("category" in body) updates.category = body.category;
  if ("sort_order" in body) updates.sort_order = body.sort_order;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("voice_guide")
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
  if (!row || !row.client_id || !row.workspace_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (
    !hasClientAccess(
      user.memberships,
      row.client_id,
      row.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("voice_guide").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
