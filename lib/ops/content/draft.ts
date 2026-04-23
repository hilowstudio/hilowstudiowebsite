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

async function fetchWorkspaceVoice(
  workspaceId: string,
): Promise<string | null> {
  const db = getSupabase();
  const { data } = await db
    .from("voice_guide")
    .select("content, sort_order")
    .eq("category", "principle")
    .eq("workspace_id", workspaceId)
    .is("client_id", null)
    .order("sort_order", { ascending: true });

  if (data && data.length > 0) {
    return (data as { content: string }[]).map((r) => r.content).join("\n\n");
  }
  return null;
}

export async function composePostFromPrompt(params: {
  workspaceId: string;
  clientId?: string | null;
  prompt: string;
  pillarLabel?: string | null;
  hookType?: string | null;
  funnelStage?: string | null;
}): Promise<string | null> {
  const voice = params.clientId
    ? await fetchClientVoice(params.clientId)
    : await fetchWorkspaceVoice(params.workspaceId);
  const voiceHeading = params.clientId
    ? "Voice guide for this client"
    : "Voice guide for this workspace";
  const voiceBlock = voice
    ? `\n\n---\n\n## ${voiceHeading}\n\n${voice}`
    : "";

  const contextLines: string[] = [];
  if (params.pillarLabel) contextLines.push(`Content pillar: ${params.pillarLabel}`);
  if (params.hookType) contextLines.push(`Hook type: ${params.hookType}`);
  if (params.funnelStage) contextLines.push(`Funnel stage: ${params.funnelStage}`);

  const userContent = [
    contextLines.length > 0 ? contextLines.join("\n") : null,
    `Operator prompt:\n${params.prompt}`,
    `Output only the LinkedIn post body. No preamble. No "Here's your post". No hashtags unless they emerge naturally. Keep it tight; LinkedIn rewards concrete specifics over generality.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await opsGenerateText({
    scope: {
      workspaceId: params.workspaceId,
      clientId: params.clientId ?? null,
    },
    tier: "strong",
    system: PERSONA_SYSTEM_PROMPT + voiceBlock,
    messages: [{ role: "user", content: userContent }],
    maxTokens: 1200,
  });

  const text = result.text.trim();
  return text || null;
}
