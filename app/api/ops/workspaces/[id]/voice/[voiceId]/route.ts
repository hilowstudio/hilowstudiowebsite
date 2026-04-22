import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

async function ensureVoiceInWorkspace(workspaceId: string, voiceId: string) {
  const { data } = await supabase
    .from("voice_guide")
    .select("id, workspace_id, client_id")
    .eq("id", voiceId)
    .maybeSingle();
  if (!data) return { found: false as const };
  if (data.workspace_id !== workspaceId || data.client_id !== null) {
    return { found: true as const, scoped: false as const };
  }
  return { found: true as const, scoped: true as const };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; voiceId: string }> },
) {
  const { id, voiceId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensureVoiceInWorkspace(id, voiceId);
  if (!check.found)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!check.scoped)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const allowed = ["category", "content", "sort_order"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("voice_guide")
    .update(updates)
    .eq("id", voiceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; voiceId: string }> },
) {
  const { id, voiceId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensureVoiceInWorkspace(id, voiceId);
  if (!check.found)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!check.scoped)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("voice_guide")
    .delete()
    .eq("id", voiceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
