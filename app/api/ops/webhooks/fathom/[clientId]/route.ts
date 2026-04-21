import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  normalizeFathomPayload,
  verifyFathomSignature,
  type FathomPayload,
} from "@/lib/ops/meetings/fathom";
import { ingestMeeting } from "@/lib/ops/meetings/ingest";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;

  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id, name")
    .eq("id", clientId)
    .maybeSingle();
  const client = clientRow as {
    id: string;
    workspace_id: string;
    name: string;
  } | null;
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const raw = await request.text();
  const signature =
    request.headers.get("x-fathom-signature") ||
    request.headers.get("x-signature");

  const valid = await verifyFathomSignature(raw, signature, {
    workspaceId: client.workspace_id,
    clientId: client.id,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: FathomPayload;
  try {
    payload = JSON.parse(raw) as FathomPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const normalized = normalizeFathomPayload(payload);
  if (!normalized) {
    return NextResponse.json(
      { error: "Missing id in payload" },
      { status: 400 },
    );
  }

  const result = await ingestMeeting(
    {
      clientId: client.id,
      sourceType: "fathom",
      externalId: normalized.externalId,
      title: normalized.title,
      startedAt: normalized.startedAt,
      durationMinutes: normalized.durationMinutes,
      participants: normalized.participants,
      transcriptUrl: normalized.transcriptUrl,
      transcriptText: normalized.transcriptText,
      audioUrl: normalized.audioUrl,
    },
    { clientName: client.name },
  );

  if (!result.meetingId) {
    return NextResponse.json(
      { error: result.error || "Ingest failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    meeting_id: result.meetingId,
    insights_extracted: result.insightsExtracted,
  });
}
