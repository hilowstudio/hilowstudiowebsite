import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { transcribeViaDeepgram } from "@/lib/ops/meetings/transcribe";
import { ingestMeeting } from "@/lib/ops/meetings/ingest";
import { resolveSetting } from "@/lib/ops/settings";
import {
  assertCapOrBYOK,
  incrementUsage,
  QuotaExceededError,
} from "@/lib/ops/meters";

const BUCKET = "ops-meetings";
const SIGNED_URL_TTL = 60 * 60;

function safeExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return "bin";
  return filename.slice(idx + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: clientId } = await params;

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

  const form = await request.formData();
  const file = form.get("file");
  const title = typeof form.get("title") === "string" ? (form.get("title") as string) : null;
  const startedAt = typeof form.get("started_at") === "string"
    ? (form.get("started_at") as string)
    : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File exceeds 200 MB limit" },
      { status: 413 },
    );
  }

  const externalId = `manual:${crypto.randomUUID()}`;
  const ext = safeExt(file.name);
  const objectPath = `${client.id}/${externalId.replace("manual:", "")}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL);
  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: `Could not sign storage URL: ${signedError?.message ?? "unknown"}` },
      { status: 500 },
    );
  }

  const deepgramKey = await resolveSetting("deepgram_api_key", {
    workspaceId: client.workspace_id,
    clientId: client.id,
  });
  const deepgramByok =
    deepgramKey?.source === "workspace" || deepgramKey?.source === "client";

  try {
    await assertCapOrBYOK(client.id, "transcription_minutes", {
      byokPresent: deepgramByok,
    });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: err.message, code: err.code, meter: err.meter },
        { status: 402 },
      );
    }
    throw err;
  }

  let transcriptText: string;
  let durationSeconds: number | null = null;
  try {
    const transcript = await transcribeViaDeepgram(signed.signedUrl, {
      workspaceId: client.workspace_id,
      clientId: client.id,
    });
    transcriptText = transcript.rawTranscript;
    durationSeconds = transcript.durationSeconds;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Transcription failed",
      },
      { status: 502 },
    );
  }

  if (durationSeconds && durationSeconds > 0) {
    await incrementUsage(
      client.id,
      "transcription_minutes",
      Math.max(1, Math.ceil(durationSeconds / 60)),
      { byokOverride: deepgramByok },
    );
  }

  const durationMinutes = durationSeconds
    ? Math.max(1, Math.round(durationSeconds / 60))
    : null;

  const result = await ingestMeeting(
    {
      clientId: client.id,
      sourceType: "manual",
      externalId,
      title: title || file.name,
      startedAt: startedAt || new Date().toISOString(),
      durationMinutes,
      participants: [],
      transcriptUrl: null,
      transcriptText,
      audioUrl: null,
    },
    { clientName: client.name, workspaceId: client.workspace_id },
  );

  if (!result.meetingId) {
    return NextResponse.json(
      { error: result.error || "Could not store meeting" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      meeting_id: result.meetingId,
      insights_extracted: result.insightsExtracted,
      warning: result.error ?? null,
    },
    { status: 201 },
  );
}
