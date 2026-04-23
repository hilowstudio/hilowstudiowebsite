import { opsGenerateObject } from "@/lib/ops/llm";
import { meetingInsightSchema } from "@/lib/ai/schemas";

export type ExtractedInsight =
  | { kind: "action_item"; body: string; speaker?: string; timestamp_seconds?: number; metadata?: Record<string, unknown> }
  | { kind: "quote"; body: string; speaker?: string; timestamp_seconds?: number; metadata?: Record<string, unknown> }
  | { kind: "brief"; body: string; metadata?: Record<string, unknown> }
  | { kind: "churn_signal"; body: string; metadata?: Record<string, unknown> }
  | { kind: "upsell_signal"; body: string; metadata?: Record<string, unknown> }
  | { kind: "referral_signal"; body: string; metadata?: Record<string, unknown> };

const SYSTEM_PROMPT = `You are an agency operations analyst. Given a client meeting transcript, produce:
1. A 2-3 sentence brief summarizing what happened (what the client said, what decisions were made).
2. A list of action items (concrete tasks for the agency to execute, with the speaker who raised them if identifiable).
3. A list of compelling quotes (sentences worth capturing as testimonials or pull quotes). Prefer strong, client-voice sentences.
4. Signals for churn, upsell opportunities, or referrals if present in the transcript.

Be terse. Don't invent details. Don't infer motives. If nothing relevant appears for a category, return an empty array.`;

export async function extractInsightsFromTranscript(params: {
  workspaceId: string;
  clientId: string;
  transcriptText: string;
  meetingTitle: string | null;
  clientName?: string;
}): Promise<ExtractedInsight[]> {
  const { workspaceId, clientId, transcriptText, meetingTitle, clientName } =
    params;

  const userContent = [
    meetingTitle ? `Meeting title: ${meetingTitle}` : null,
    clientName ? `Client: ${clientName}` : null,
    "Transcript:",
    transcriptText.slice(0, 60000),
  ]
    .filter(Boolean)
    .join("\n\n");

  let payload;
  try {
    const result = await opsGenerateObject({
      scope: { workspaceId, clientId },
      tier: "standard",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      schema: meetingInsightSchema,
      maxTokens: 3000,
    });
    payload = result.object;
  } catch {
    return [];
  }

  const out: ExtractedInsight[] = [];

  if (payload.brief) {
    out.push({ kind: "brief", body: payload.brief });
  }

  for (const item of payload.actionItems ?? []) {
    if (!item.body) continue;
    out.push({
      kind: "action_item",
      body: item.body,
      speaker: item.speaker ?? undefined,
      timestamp_seconds: item.timestampSeconds ?? undefined,
    });
  }

  for (const quote of payload.quotes ?? []) {
    if (!quote.body) continue;
    out.push({
      kind: "quote",
      body: quote.body,
      speaker: quote.speaker ?? undefined,
    });
  }

  for (const signal of payload.signals ?? []) {
    if (!signal.body) continue;
    out.push({ kind: signal.kind, body: signal.body });
  }

  return out;
}
