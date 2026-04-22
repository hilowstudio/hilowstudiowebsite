import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

function cleanList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return (input as unknown[])
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

async function loadClient(id: string) {
  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", id)
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
    .from("ops_clients")
    .select("title_keywords, participant_emails, participant_domains")
    .eq("id", id)
    .maybeSingle();
  return NextResponse.json(
    data ?? {
      title_keywords: [],
      participant_emails: [],
      participant_domains: [],
    },
  );
}

export async function PUT(
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
    title_keywords?: unknown;
    participant_emails?: unknown;
    participant_domains?: unknown;
  };

  const updates: Record<string, unknown> = {};
  if ("title_keywords" in body)
    updates.title_keywords = cleanList(body.title_keywords);
  if ("participant_emails" in body)
    updates.participant_emails = cleanList(body.participant_emails);
  if ("participant_domains" in body)
    updates.participant_domains = cleanList(body.participant_domains);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ops_clients")
    .update(updates)
    .eq("id", id)
    .select("title_keywords, participant_emails, participant_domains")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
