import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { draftPostFromMeeting } from "@/lib/ops/meetings/post-draft";
import { QuotaExceededError } from "@/lib/ops/meters";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: meetingRow } = await supabase
    .from("ops_meetings")
    .select("id, client_id, ops_clients(workspace_id)")
    .eq("id", id)
    .maybeSingle();
  const meeting = meetingRow as unknown as {
    id: string;
    client_id: string;
    ops_clients: { workspace_id: string } | null;
  } | null;
  if (!meeting || !meeting.ops_clients) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (
    !hasClientAccess(
      user.memberships,
      meeting.client_id,
      meeting.ops_clients.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await draftPostFromMeeting(meeting.id);
    if (!result) {
      return NextResponse.json(
        { error: "Meeting has no transcript to draft from" },
        { status: 400 },
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          meter: err.meter,
        },
        { status: 402 },
      );
    }
    const message = err instanceof Error ? err.message : "Draft failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
