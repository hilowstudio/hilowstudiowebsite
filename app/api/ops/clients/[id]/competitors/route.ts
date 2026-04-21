import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

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
    .from("ops_competitors")
    .select("*")
    .eq("client_id", client.id)
    .order("name", { ascending: true });
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
    name?: string;
    linkedin_url?: string;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ops_competitors")
    .insert({
      client_id: client.id,
      name: body.name.trim(),
      linkedin_url: body.linkedin_url?.trim() || null,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
