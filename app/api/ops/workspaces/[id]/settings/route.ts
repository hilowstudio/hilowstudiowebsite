import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import {
  deleteSetting,
  listSettingsForScope,
  writeSetting,
  type SettingKey,
} from "@/lib/ops/settings";

const ALLOWED_KEYS: SettingKey[] = [
  "anthropic_api_key",
  "deepgram_api_key",
  "openrouter_api_key",
  "fireflies_api_key",
  "fathom_api_key",
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

  const settings = await listSettingsForScope("workspace", id);
  return NextResponse.json(settings);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "owner", user.isPlatformAdmin)) {
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
    await deleteSetting(body.key, { scope: "workspace", scopeId: id });
    return NextResponse.json({ ok: true, removed: true });
  }

  await writeSetting(body.key, body.value, {
    scope: "workspace",
    scopeId: id,
  });
  return NextResponse.json({ ok: true });
}
