import { opsCreateMessage, SONNET_MODEL } from "@/lib/ops/llm";

export type ExtractedInsight =
  | { kind: "action_item"; body: string; speaker?: string; timestamp_seconds?: number; metadata?: Record<string, unknown> }
  | { kind: "quote"; body: string; speaker?: string; timestamp_seconds?: number; metadata?: Record<string, unknown> }
  | { kind: "brief"; body: string; metadata?: Record<string, unknown> }
  | { kind: "churn_signal"; body: string; metadata?: Record<string, unknown> }
  | { kind: "upsell_signal"; body: string; metadata?: Record<string, unknown> }
  | { kind: "referral_signal"; body: string; metadata?: Record<string, unknown> };

type InsightPayload = {
  brief: string;
  action_items: { body: string; speaker?: string; timestamp_seconds?: number }[];
  quotes: { body: string; speaker?: string; timestamp_seconds?: number }[];
  signals: { kind: "churn" | "upsell" | "referral"; body: string }[];
};

const SYSTEM_PROMPT = `You are an agency operations analyst. Given a client meeting transcript, produce:
1. A 2-3 sentence brief summarizing what happened (what the client said, what decisions were made).
2. A list of action items (concrete tasks for the agency to execute, with the speaker who raised them if identifiable).
3. A list of compelling quotes (sentences worth capturing as testimonials or pull quotes). Prefer strong, client-voice sentences.
4. Signals for churn, upsell opportunities, or referrals if present in the transcript.

Be terse. Don't invent details. Don't infer motives. If nothing relevant appears for a category, return an empty array.

Output JSON exactly matching this schema:
{
  "brief": "string",
  "action_items": [{ "body": "string", "speaker": "string?", "timestamp_seconds": 0 }],
  "quotes": [{ "body": "string", "speaker": "string?", "timestamp_seconds": 0 }],
  "signals": [{ "kind": "churn|upsell|referral", "body": "string" }]
}`;

export async function extractInsightsFromTranscript(params: {
  workspaceId: string;
  clientId: string;
  transcriptText: string;
  meetingTitle: string | null;
  clientName?: string;
}): Promise<ExtractedInsight[]> {
  const { workspaceId, clientId, transcriptText, meetingTitle, clientName } = params;

  const userContent = [
    meetingTitle ? `Meeting title: ${meetingTitle}` : null,
    clientName ? `Client: ${clientName}` : null,
    "Transcript:",
    transcriptText.slice(0, 60000),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await opsCreateMessage(
    { workspaceId, clientId },
    {
      model: SONNET_MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    },
  );

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return [];

  const text = block.text.trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return [];
  const raw = text.slice(jsonStart, jsonEnd + 1);

  let payload: InsightPayload;
  try {
    payload = JSON.parse(raw) as InsightPayload;
  } catch {
    return [];
  }

  const out: ExtractedInsight[] = [];

  if (payload.brief) {
    out.push({ kind: "brief", body: payload.brief });
  }

  for (const item of payload.action_items ?? []) {
    if (!item.body) continue;
    out.push({
      kind: "action_item",
      body: item.body,
      speaker: item.speaker,
      timestamp_seconds: item.timestamp_seconds,
    });
  }

  for (const quote of payload.quotes ?? []) {
    if (!quote.body) continue;
    out.push({
      kind: "quote",
      body: quote.body,
      speaker: quote.speaker,
      timestamp_seconds: quote.timestamp_seconds,
    });
  }

  for (const signal of payload.signals ?? []) {
    if (!signal.body) continue;
    const kind =
      signal.kind === "churn"
        ? "churn_signal"
        : signal.kind === "upsell"
          ? "upsell_signal"
          : "referral_signal";
    out.push({ kind, body: signal.body });
  }

  return out;
}
