import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { composePostFromPrompt } from "@/lib/ops/content/draft";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "staff", user.isPlatformAdmin)) {
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
      workspaceId: id,
      clientId: null,
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draft failed" },
      { status: 500 },
    );
  }
}
