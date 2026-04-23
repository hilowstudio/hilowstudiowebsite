import { getSupabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { opsGenerateText } from "@/lib/ops/llm";

const BRIEF_SYSTEM_PROMPT = `${PERSONA_SYSTEM_PROMPT}

---

You are preparing a concise pre-meeting brief for an agency operator about to walk into a client conversation. The goal is to help them show up warm, prepared, and specific. Use prior meetings, recent notes, and any context the operator provides.

Output these four sections, nothing else:

**Where we left off** — one paragraph, what happened in the last touchpoint(s) that matters now.

**Open loops** — bullet list of 2-5 action items / decisions still pending. Be concrete.

**Likely topics today** — bullet list of 2-4 things the client may raise, based on prior conversation.

**Opener** — one sentence the operator can lead with that shows continuity (not a greeting, the substantive first move).

No preamble. No hedging. Keep it tight. Never invent details. If prior history is thin, say so.`;

export async function generatePreMeetingBrief(params: {
  clientId: string;
  meetingTitle: string;
  meetingContext: string | null;
  scheduledFor: string | null;
}): Promise<string | null> {
  const db = getSupabase();

  const { data: clientRow } = await db
    .from("ops_clients")
    .select("id, name, company, workspace_id")
    .eq("id", params.clientId)
    .maybeSingle();
  if (!clientRow) return null;
  const client = clientRow as {
    id: string;
    name: string;
    company: string | null;
    workspace_id: string;
  };

  const { data: priorMeetings } = await db
    .from("ops_meetings")
    .select("title, started_at, transcript_text")
    .eq("client_id", client.id)
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(3);

  const meetingContext = (priorMeetings ?? []) as {
    title: string | null;
    started_at: string | null;
    transcript_text: string | null;
  }[];

  const meetingsSummary = meetingContext
    .map((m, i) => {
      const date = m.started_at
        ? new Date(m.started_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "unknown date";
      const snippet = (m.transcript_text ?? "")
        .slice(0, 2500)
        .replace(/\s+/g, " ");
      return `Meeting ${i + 1} (${date}) — ${m.title ?? "untitled"}:\n${snippet || "(no transcript)"}`;
    })
    .join("\n\n");

  const { data: priorInsights } = await db
    .from("ops_meeting_insights")
    .select("kind, body, ops_meetings!inner(client_id, started_at)")
    .eq("ops_meetings.client_id", client.id)
    .in("kind", ["action_item", "brief", "churn_signal", "upsell_signal"])
    .order("created_at", { ascending: false })
    .limit(15);

  const insightsSummary = (
    (priorInsights ?? []) as unknown as { kind: string; body: string }[]
  )
    .map((i) => `- [${i.kind}] ${i.body}`)
    .join("\n");

  const userContent = [
    `Client: ${client.name}${client.company ? ` (${client.company})` : ""}`,
    `Upcoming meeting title: ${params.meetingTitle}`,
    params.scheduledFor
      ? `Scheduled for: ${new Date(params.scheduledFor).toLocaleString("en-US")}`
      : null,
    params.meetingContext
      ? `Operator-provided context:\n${params.meetingContext}`
      : null,
    meetingsSummary ? `Recent meetings:\n\n${meetingsSummary}` : null,
    insightsSummary ? `Recent insights across meetings:\n${insightsSummary}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await opsGenerateText({
    scope: { workspaceId: client.workspace_id, clientId: client.id },
    tier: "standard",
    system: BRIEF_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
    maxTokens: 1200,
  });

  const text = result.text.trim();
  return text || null;
}
