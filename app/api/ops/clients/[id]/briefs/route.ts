import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { generatePreMeetingBrief } from "@/lib/ops/meetings/brief";
import { QuotaExceededError } from "@/lib/ops/meters";

async function loadClient(clientId: string) {
  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

export async function GET(
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
      "client_viewer",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("ops_pre_meeting_briefs")
    .select("*")
    .eq("client_id", client.id)
    .order("generated_at", { ascending: false })
    .limit(20);

  return NextResponse.json(data ?? []);
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
    meeting_title?: string;
    meeting_context?: string;
    scheduled_for?: string;
  };
  if (!body.meeting_title?.trim()) {
    return NextResponse.json(
      { error: "meeting_title required" },
      { status: 400 },
    );
  }

  let briefBody: string | null;
  try {
    briefBody = await generatePreMeetingBrief({
      clientId: client.id,
      meetingTitle: body.meeting_title.trim(),
      meetingContext: body.meeting_context?.trim() || null,
      scheduledFor: body.scheduled_for || null,
    });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: err.message, code: err.code, meter: err.meter },
        { status: 402 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Brief failed" },
      { status: 500 },
    );
  }

  if (!briefBody) {
    return NextResponse.json({ error: "Could not generate brief" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("ops_pre_meeting_briefs")
    .insert({
      client_id: client.id,
      meeting_title: body.meeting_title.trim(),
      meeting_context: body.meeting_context?.trim() || null,
      scheduled_for: body.scheduled_for || null,
      brief_body: briefBody,
      created_by_user_id: user.isPlatformAdmin ? null : user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
