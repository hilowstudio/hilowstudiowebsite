import crypto from "crypto";
import { resolveSetting } from "@/lib/ops/settings";

export type FathomPayload = {
  id?: string;
  meeting_id?: string;
  title?: string;
  name?: string;
  started_at?: string;
  start_time?: string;
  date?: string;
  duration_seconds?: number;
  duration?: number;
  attendees?: { name?: string; email?: string }[];
  participants?: { name?: string }[] | string[];
  transcript?: string;
  transcript_text?: string;
  transcript_url?: string;
  recording_url?: string;
  audio_url?: string;
};

export type NormalizedFathomMeeting = {
  externalId: string;
  title: string | null;
  startedAt: string | null;
  durationMinutes: number | null;
  participants: string[];
  transcriptText: string;
  transcriptUrl: string | null;
  audioUrl: string | null;
};

export function normalizeFathomPayload(
  payload: FathomPayload,
): NormalizedFathomMeeting | null {
  const externalId = payload.id || payload.meeting_id;
  if (!externalId) return null;

  const rawStart = payload.started_at || payload.start_time || payload.date;
  const startedAt = rawStart ? new Date(rawStart).toISOString() : null;

  let durationMinutes: number | null = null;
  if (typeof payload.duration_seconds === "number") {
    durationMinutes = Math.round(payload.duration_seconds / 60);
  } else if (typeof payload.duration === "number") {
    durationMinutes = Math.round(payload.duration / 60);
  }

  const participants: string[] = [];
  for (const a of payload.attendees ?? []) {
    if (a.name) participants.push(a.name);
    else if (a.email) participants.push(a.email);
  }
  for (const p of payload.participants ?? []) {
    if (typeof p === "string") participants.push(p);
    else if (p && typeof p === "object" && "name" in p && p.name)
      participants.push(p.name);
  }

  return {
    externalId: `fathom:${externalId}`,
    title: payload.title || payload.name || null,
    startedAt,
    durationMinutes,
    participants,
    transcriptText: payload.transcript || payload.transcript_text || "",
    transcriptUrl: payload.transcript_url ?? null,
    audioUrl: payload.recording_url || payload.audio_url || null,
  };
}

export async function verifyFathomSignature(
  rawBody: string,
  signatureHeader: string | null,
  scope: { workspaceId: string; clientId: string },
): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = await resolveSetting("fathom_api_key", scope);
  if (!secret) return false;

  const computed = crypto
    .createHmac("sha256", secret.value)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader.replace(/^sha256=/, ""), "hex"),
      Buffer.from(computed, "hex"),
    );
  } catch {
    return false;
  }
}
