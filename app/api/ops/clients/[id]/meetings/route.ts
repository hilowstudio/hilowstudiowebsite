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

  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const client = clientRow as { id: string; workspace_id: string } | null;
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_owner",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("ops_meetings")
    .delete()
    .eq("client_id", client.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
