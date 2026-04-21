import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import {
  deleteSetting,
  listSettingsForScope,
  writeSetting,
  type SettingKey,
} from "@/lib/ops/settings";

const ALLOWED_KEYS: SettingKey[] = [
  "fireflies_api_key",
  "fathom_api_key",
  "anthropic_api_key",
  "deepgram_api_key",
  "openrouter_api_key",
];

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
  if (!client)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const settings = await listSettingsForScope("client", client.id);
  return NextResponse.json(settings);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await loadClient(id);
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
    key?: SettingKey;
    value?: string;
  };
  if (!body.key || !ALLOWED_KEYS.includes(body.key)) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }

  if (!body.value) {
    await deleteSetting(body.key, { scope: "client", scopeId: client.id });
    return NextResponse.json({ ok: true, removed: true });
  }

  await writeSetting(body.key, body.value, { scope: "client", scopeId: client.id });
  return NextResponse.json({ ok: true });
}
