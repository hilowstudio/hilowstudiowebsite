import { getSupabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { opsGenerateText } from "@/lib/ops/llm";

async function fetchClientVoice(clientId: string): Promise<string | null> {
  const db = getSupabase();
  const { data } = await db
    .from("voice_guide")
    .select("content, sort_order")
    .eq("category", "principle")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true });

  if (data && data.length > 0) {
    return (data as { content: string }[]).map((r) => r.content).join("\n\n");
  }
  return null;
}

export async function draftPostFromMeeting(meetingId: string): Promise<{
  draftBody: string;
  draftId: string;
} | null> {
  const db = getSupabase();

  const { data: meetingRow } = await db
    .from("ops_meetings")
    .select(
      "id, client_id, title, transcript_text, ops_clients(name, workspace_id)",
    )
    .eq("id", meetingId)
    .maybeSingle();

  if (!meetingRow) return null;
  const meeting = meetingRow as unknown as {
    id: string;
    client_id: string;
    title: string | null;
    transcript_text: string | null;
    ops_clients: { name: string; workspace_id: string } | null;
  };
  if (!meeting.transcript_text) return null;

  const { data: insightsData } = await db
    .from("ops_meeting_insights")
    .select("kind, body")
    .eq("meeting_id", meeting.id)
    .in("kind", ["brief", "quote"]);
  const insights =
    (insightsData as { kind: string; body: string }[]) ?? [];

  const brief = insights.find((i) => i.kind === "brief")?.body ?? null;
  const quotes = insights
    .filter((i) => i.kind === "quote")
    .map((q) => q.body)
    .slice(0, 5);

  const clientVoice = await fetchClientVoice(meeting.client_id);
  const voiceBlock = clientVoice
    ? `\n\n---\n\n## Voice guide for this client\n\n${clientVoice}`
    : "";

  const userContent = [
    `Write a single LinkedIn post drawn from the client conversation below. The post should sound like the client's voice (captured in the voice guide), not an agency voice.`,
    meeting.ops_clients?.name
      ? `Client: ${meeting.ops_clients.name}`
      : null,
    meeting.title ? `Meeting: ${meeting.title}` : null,
    brief ? `Brief:\n${brief}` : null,
    quotes.length > 0
      ? `Quotable moments to lean on:\n${quotes.map((q) => `- ${q}`).join("\n")}`
      : null,
    `Full transcript (truncated if long):\n${meeting.transcript_text.slice(0, 40000)}`,
    `Output only the post body. No preamble. No "Here's your post". No hashtags unless they emerge naturally. Keep it tight; LinkedIn rewards concrete specifics over generality.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const workspaceId = meeting.ops_clients?.workspace_id;
  if (!workspaceId) return null;

  const result = await opsGenerateText({
    scope: { workspaceId, clientId: meeting.client_id },
    tier: "strong",
    system: PERSONA_SYSTEM_PROMPT + voiceBlock,
    messages: [{ role: "user", content: userContent }],
    maxTokens: 1200,
  });

  const draftBody = result.text.trim();
  if (!draftBody) return null;

  const { data: insertedRaw, error } = await db
    .from("ops_meeting_post_drafts")
    .insert({
      meeting_id: meeting.id,
      draft_body: draftBody,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !insertedRaw) return null;
  const inserted = insertedRaw as { id: string };

  return { draftBody, draftId: inserted.id };
}
