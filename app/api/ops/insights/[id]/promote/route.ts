import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: row } = await supabase
    .from("ops_meeting_insights")
    .select(
      "id, kind, body, speaker, meeting_id, ops_meetings!inner(client_id, ops_clients!inner(workspace_id))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const insight = row as unknown as {
    id: string;
    kind: string;
    body: string;
    speaker: string | null;
    meeting_id: string;
    ops_meetings: {
      client_id: string;
      ops_clients: { workspace_id: string } | null;
    } | null;
  };

  const clientId = insight.ops_meetings?.client_id;
  const workspaceId = insight.ops_meetings?.ops_clients?.workspace_id;
  if (!clientId || !workspaceId) {
    return NextResponse.json({ error: "Insight has no client" }, { status: 404 });
  }

  if (
    !hasClientAccess(
      user.memberships,
      clientId,
      workspaceId,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (insight.kind !== "quote") {
    return NextResponse.json(
      { error: "Only quote insights can be promoted" },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    attribution_role?: string;
  };

  const { data: inserted, error } = await supabase
    .from("ops_testimonials")
    .insert({
      client_id: clientId,
      source_insight_id: insight.id,
      source_meeting_id: insight.meeting_id,
      body: insight.body,
      attributed_to: insight.speaker,
      attribution_role: body.attribution_role || null,
      approved: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
