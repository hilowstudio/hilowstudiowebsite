import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest, generateInviteToken } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { sendInviteEmail } from "@/lib/ops/invite-email";

const EXPIRY_DAYS = 14;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const client = clientRow as { id: string; workspace_id: string } | null;
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
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

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    role?: "client_owner" | "client_contributor" | "client_viewer";
  };
  if (!body.email?.trim()) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  const { data, error } = await supabase
    .from("ops_invites")
    .insert({
      email: body.email.toLowerCase().trim(),
      scope: "client",
      scope_id: client.id,
      role: body.role || "client_viewer",
      token,
      invited_by: user.isPlatformAdmin ? null : user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select("token, email, role, expires_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const emailResult = await sendInviteEmail({
    email: (data as { email: string }).email,
    token: (data as { token: string }).token,
    scope: "client",
    scopeId: client.id,
    role: (data as { role: string }).role,
    inviterEmail: user.email,
  });

  return NextResponse.json(
    {
      ...(data as object),
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : emailResult.reason,
    },
    { status: 201 },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const client = clientRow as { id: string; workspace_id: string } | null;
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
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
    .from("ops_invites")
    .select("id, email, role, token, expires_at, accepted_at, created_at")
    .eq("scope", "client")
    .eq("scope_id", client.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}
