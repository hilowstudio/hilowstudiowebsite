import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

const ALLOWED_FIELDS = [
  "name",
  "company",
  "email",
  "linkedin_url",
  "source",
  "status",
  "notes",
  "next_follow_up_at",
];

async function loadLead(id: string) {
  const { data } = await supabase
    .from("ops_leads")
    .select("id, workspace_id, status, network_contact_id")
    .eq("id", id)
    .maybeSingle();
  return data as {
    id: string;
    workspace_id: string;
    status: string;
    network_contact_id: string | null;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lead = await loadLead(id);
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
  const { data } = await supabase
    .from("ops_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lead = await loadLead(id);
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

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ops_leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lead = await loadLead(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasWorkspaceAccess(
      user.memberships,
      lead.workspace_id,
      "owner",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase.from("ops_leads").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
