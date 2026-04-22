import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { draftOutreachForLead } from "@/lib/ops/pipeline/draft-outreach";

const ALLOWED_KINDS = ["dm", "inmail", "email"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: leadRow } = await supabase
    .from("ops_leads")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const lead = leadRow as { id: string; workspace_id: string } | null;
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasWorkspaceAccess(
      user.memberships,
      lead.workspace_id,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    kind?: string;
    angle?: string;
  };
  if (!body.kind || !ALLOWED_KINDS.includes(body.kind)) {
    return NextResponse.json(
      { error: `kind must be one of ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 },
    );
  }
  if (!body.angle?.trim()) {
    return NextResponse.json({ error: "angle required" }, { status: 400 });
  }

  try {
    const result = await draftOutreachForLead({
      leadId: lead.id,
      kind: body.kind as "dm" | "inmail" | "email",
      angle: body.angle.trim(),
    });
    if (!result) {
      return NextResponse.json({ error: "Draft failed" }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draft failed" },
      { status: 500 },
    );
  }
}
