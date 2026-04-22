import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import {
  parseLinkedInConnectionsCsv,
  deriveUrnFromUrl,
} from "@/lib/ops/network/import-csv";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId } = await params;

  if (
    !hasWorkspaceAccess(
      user.memberships,
      workspaceId,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "CSV exceeds 10 MB" }, { status: 413 });
  }

  const text = await file.text();
  const rows = parseLinkedInConnectionsCsv(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No rows found. Expected a LinkedIn connections export CSV." },
      { status: 400 },
    );
  }

  const urlsInFile = rows
    .map((r) => r.linkedin_url)
    .filter((u): u is string => Boolean(u));

  const { data: existingData } = urlsInFile.length
    ? await supabase
        .from("ops_network_contacts")
        .select("linkedin_url")
        .eq("workspace_id", workspaceId)
        .in("linkedin_url", urlsInFile)
    : { data: [] };

  const existingUrls = new Set(
    ((existingData ?? []) as { linkedin_url: string | null }[])
      .map((r) => r.linkedin_url)
      .filter(Boolean),
  );

  let inserted = 0;
  let skipped = 0;
  const BATCH = 200;
  const buffer: Record<string, unknown>[] = [];

  async function flush() {
    if (buffer.length === 0) return;
    const { error } = await supabase
      .from("ops_network_contacts")
      .insert([...buffer]);
    if (!error) inserted += buffer.length;
    buffer.length = 0;
  }

  for (const row of rows) {
    if (row.linkedin_url && existingUrls.has(row.linkedin_url)) {
      skipped += 1;
      continue;
    }
    buffer.push({
      workspace_id: workspaceId,
      client_id: null,
      linkedin_urn: deriveUrnFromUrl(row.linkedin_url),
      linkedin_url: row.linkedin_url,
      name: row.name,
      company: row.company,
      headline: row.headline,
      imported_via: "csv_export",
      tags: row.connected_on ? [{ connected_on: row.connected_on }] : [],
    });
    if (buffer.length >= BATCH) await flush();
  }
  await flush();

  return NextResponse.json({
    parsed: rows.length,
    inserted,
    skipped_duplicate: skipped,
  });
}
