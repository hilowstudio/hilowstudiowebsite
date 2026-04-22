import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: meetingRow } = await supabase
    .from("ops_meetings")
    .select("id, client_id, ops_clients!inner(workspace_id)")
    .eq("id", id)
    .maybeSingle();
  const meeting = meetingRow as unknown as {
    id: string;
    client_id: string;
    ops_clients: { workspace_id: string } | null;
  } | null;
  if (!meeting?.ops_clients) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const { error } = await supabase.from("ops_meetings").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
