import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { rebuildWarmProspects } from "@/lib/ops/network/warm-prospects";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const client = data as { id: string; workspace_id: string } | null;
  if (!client)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const top = await rebuildWarmProspects(client.id);
  return NextResponse.json({ top: top.length });
}
