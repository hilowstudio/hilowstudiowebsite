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

  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const client = clientRow as { id: string; workspace_id: string } | null;
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

  const body = (await request.json().catch(() => ({}))) as {
    contact_name?: string;
    contact_linkedin_url?: string;
    kind?: "like" | "comment" | "reshare";
    competitor_id?: string;
    note?: string;
  };

  if (!body.contact_name?.trim() || !body.kind) {
    return NextResponse.json(
      { error: "contact_name and kind required" },
      { status: 400 },
    );
  }

  let contactId: string | null = null;
  if (body.contact_linkedin_url) {
    const { data: existing } = await supabase
      .from("ops_network_contacts")
      .select("id")
      .eq("client_id", client.id)
      .eq("linkedin_url", body.contact_linkedin_url)
      .maybeSingle();
    contactId = (existing as { id: string } | null)?.id ?? null;
  }
  if (!contactId) {
    const { data: created } = await supabase
      .from("ops_network_contacts")
      .insert({
        client_id: client.id,
        name: body.contact_name.trim(),
        linkedin_url: body.contact_linkedin_url?.trim() || null,
        imported_via: "manual",
      })
      .select("id")
      .single();
    contactId = (created as { id: string } | null)?.id ?? null;
  }

  if (!contactId) {
    return NextResponse.json(
      { error: "Could not upsert network contact" },
      { status: 500 },
    );
  }

  const raw: Record<string, unknown> = {};
  if (body.note) raw.note = body.note;
  if (body.competitor_id) raw.competitor_id = body.competitor_id;
  raw.source = "manual";

  const { data, error } = await supabase
    .from("ops_engagement_events")
    .insert({
      client_id: client.id,
      network_contact_id: contactId,
      post_id: null,
      kind: body.kind,
      raw,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
