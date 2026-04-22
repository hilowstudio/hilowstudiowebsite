import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

const SETTINGS_KEY = "enabled_hooks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { data } = await supabase
    .from("ops_workspace_settings")
    .select("value")
    .eq("workspace_id", id)
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  return NextResponse.json({
    enabledHooks: (data?.value as string[]) || [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { enabledHooks } = (await request.json()) as {
    enabledHooks: string[];
  };
  if (!Array.isArray(enabledHooks)) {
    return NextResponse.json(
      { error: "enabledHooks must be an array" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("ops_workspace_settings").upsert(
    {
      workspace_id: id,
      key: SETTINGS_KEY,
      value: enabledHooks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,key" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ enabledHooks });
}
