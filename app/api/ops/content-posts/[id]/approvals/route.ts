import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { resolveContentPostScope } from "@/lib/ops/content";

const ALLOWED_STATES = ["requested", "approved", "changes_requested"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const scope = await resolveContentPostScope(id);
  if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      scope.clientId,
      scope.workspaceId,
      "client_viewer",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("ops_content_approvals")
    .select("id, state, note, acted_at, user:ops_users(id, email, name)")
    .eq("content_post_id", id)
    .order("acted_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const scope = await resolveContentPostScope(id);
  if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      scope.clientId,
      scope.workspaceId,
      "client_viewer",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user.id === "platform-admin") {
    return NextResponse.json(
      { error: "Platform admin cannot create approvals; log in as an ops user" },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    state?: string;
    note?: string;
  };
  if (!body.state || !ALLOWED_STATES.includes(body.state)) {
    return NextResponse.json(
      { error: `state must be one of ${ALLOWED_STATES.join(", ")}` },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("ops_content_approvals")
    .insert({
      content_post_id: id,
      user_id: user.id,
      state: body.state,
      note: body.note?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
