import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { composePostFromPrompt } from "@/lib/ops/content/draft";
import { QuotaExceededError } from "@/lib/ops/meters";

async function loadClient(clientId: string) {
  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await loadClient(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    pillar_label?: string;
    hook_type?: string;
    funnel_stage?: string;
  };
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const draft = await composePostFromPrompt({
      workspaceId: client.workspace_id,
      clientId: client.id,
      prompt: body.prompt.trim(),
      pillarLabel: body.pillar_label ?? null,
      hookType: body.hook_type ?? null,
      funnelStage: body.funnel_stage ?? null,
    });
    if (!draft) {
      return NextResponse.json({ error: "Empty draft" }, { status: 500 });
    }
    return NextResponse.json({ body: draft });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: err.message, code: err.code, meter: err.meter },
        { status: 402 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draft failed" },
      { status: 500 },
    );
  }
}
