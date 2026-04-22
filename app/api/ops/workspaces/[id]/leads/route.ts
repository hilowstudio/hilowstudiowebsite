import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

const ALLOWED_STATUSES = [
  "prospect",
  "courting",
  "meeting_scheduled",
  "converted",
  "lost",
  "paused",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "staff", user.isPlatformAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status");
  let query = supabase
    .from("ops_leads")
    .select(
      "id, name, company, email, linkedin_url, source, status, last_touch_at, next_follow_up_at, converted_client_id, created_at",
    )
    .eq("workspace_id", id)
    .order("last_touch_at", { ascending: false, nullsFirst: false });
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

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
    name?: string;
    company?: string;
    email?: string;
    linkedin_url?: string;
    source?: string;
    status?: string;
    notes?: string;
    network_contact_id?: string;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const status = body.status && ALLOWED_STATUSES.includes(body.status)
    ? body.status
    : "prospect";

  // If a network_contact_id was passed, try to seed fields from it.
  let seededName = body.name.trim();
  let seededCompany = body.company?.trim() || null;
  let seededUrl = body.linkedin_url?.trim() || null;
  if (body.network_contact_id) {
    const { data: contact } = await supabase
      .from("ops_network_contacts")
      .select("name, company, linkedin_url")
      .eq("id", body.network_contact_id)
      .eq("workspace_id", id)
      .maybeSingle();
    const row = contact as {
      name: string | null;
      company: string | null;
      linkedin_url: string | null;
    } | null;
    if (row) {
      if (!body.name.trim() && row.name) seededName = row.name;
      if (!seededCompany && row.company) seededCompany = row.company;
      if (!seededUrl && row.linkedin_url) seededUrl = row.linkedin_url;
    }
  }

  const { data, error } = await supabase
    .from("ops_leads")
    .insert({
      workspace_id: id,
      network_contact_id: body.network_contact_id || null,
      name: seededName,
      company: seededCompany,
      email: body.email?.trim() || null,
      linkedin_url: seededUrl,
      source: body.source?.trim() || "manual",
      status,
      notes: body.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
