import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

const ALLOWED_KINDS = [
  "sent_dm",
  "sent_inmail",
  "sent_email",
  "received_reply",
  "event_met",
  "engaged_on_their_post",
  "commented_on_their_post",
  "phone_call",
  "note",
  "other",
];

async function loadLead(id: string) {
  const { data } = await supabase
    .from("ops_leads")
    .select("id, workspace_id, network_contact_id")
    .eq("id", id)
    .maybeSingle();
  return data as {
    id: string;
    workspace_id: string;
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
    .from("ops_outreach")
    .select("*")
    .eq("lead_id", id)
    .order("completed_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(
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

  const body = (await request.json().catch(() => ({}))) as {
    kind?: string;
    direction?: "outbound" | "inbound";
    subject?: string;
    body?: string;
    completed_at?: string;
    scheduled_for?: string;
    follow_up_at?: string;
  };
  if (!body.kind || !ALLOWED_KINDS.includes(body.kind)) {
    return NextResponse.json(
      { error: `kind must be one of ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("ops_outreach")
    .insert({
      workspace_id: lead.workspace_id,
      lead_id: lead.id,
      network_contact_id: lead.network_contact_id,
      kind: body.kind,
      direction: body.direction ?? "outbound",
      subject: body.subject?.trim() || null,
      body: body.body?.trim() || null,
      scheduled_for: body.scheduled_for || null,
      completed_at: body.completed_at ?? new Date().toISOString(),
      follow_up_at: body.follow_up_at || null,
      created_by_user_id:
        user.id === "platform-admin" ? null : user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
