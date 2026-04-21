import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  authenticateUser,
  createUser,
  setSessionCookie,
} from "@/lib/ops/auth";

type InviteRow = {
  id: string;
  email: string;
  scope: "workspace" | "client";
  scope_id: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
};

async function lookupInvite(token: string): Promise<InviteRow | null> {
  const { data } = await supabase
    .from("ops_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as InviteRow;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }
  const invite = await lookupInvite(token);
  if (!invite) {
    return NextResponse.json(
      { error: "Invite invalid or expired" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    email: invite.email,
    scope: invite.scope,
    role: invite.role,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
    name?: string;
  };

  if (!body.token || !body.password) {
    return NextResponse.json(
      { error: "token and password required" },
      { status: 400 },
    );
  }

  const invite = await lookupInvite(body.token);
  if (!invite) {
    return NextResponse.json(
      { error: "Invite invalid or expired" },
      { status: 404 },
    );
  }

  // Find or create the user.
  const { data: existing } = await supabase
    .from("ops_users")
    .select("id")
    .eq("email", invite.email.toLowerCase().trim())
    .maybeSingle();

  let userId: string;
  if (existing) {
    const ok = await authenticateUser(invite.email, body.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Account exists; password did not match" },
        { status: 401 },
      );
    }
    userId = ok.id;
  } else {
    const created = await createUser({
      email: invite.email,
      password: body.password,
      name: body.name ?? null,
    });
    userId = created.id;
  }

  // Add membership.
  if (invite.scope === "workspace") {
    const { error } = await supabase.from("ops_workspace_members").upsert(
      {
        workspace_id: invite.scope_id,
        user_id: userId,
        role: invite.role,
      },
      { onConflict: "workspace_id,user_id" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("ops_client_members").upsert(
      {
        client_id: invite.scope_id,
        user_id: userId,
        role: invite.role,
      },
      { onConflict: "client_id,user_id" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await supabase
    .from("ops_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  await setSessionCookie(userId);

  return NextResponse.json({
    user_id: userId,
    scope: invite.scope,
    scope_id: invite.scope_id,
  });
}
