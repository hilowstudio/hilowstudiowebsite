import { supabase } from "@/lib/supabase";
import { HOOK_TYPES, FUNNEL_STAGES } from "@/lib/content-strategy";
import { getContentPillars } from "@/lib/pillars";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import type {
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";
import { opsGenerateText } from "@/lib/ops/llm";
import { resolveLLMProvider } from "@/lib/ops/model-router";
import { fetchUrlAsMarkdown } from "@/lib/ops/url-fetch";
import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";

export type GenerateScope = {
  workspaceId?: string | null;
  clientId?: string | null;
};

export interface GenerateInput {
  pillar: ContentPillar;
  hookType: HookType;
  funnelStage: FunnelStage;
  sourceMaterial?: string;
  sourceUrl?: string;
  scope?: GenerateScope;
}

export class VoiceGuideMissingError extends Error {
  constructor() {
    super(
      "No voice guide principle found. Add a 'principle' row to voice_guide before generating.",
    );
    this.name = "VoiceGuideMissingError";
  }
}

async function fetchVoicePrinciple(scope?: GenerateScope): Promise<string> {
  let query = supabase
    .from("voice_guide")
    .select("content")
    .eq("category", "principle")
    .order("sort_order", { ascending: true });

  if (scope?.workspaceId) query = query.eq("workspace_id", scope.workspaceId);
  if (scope && "clientId" in scope) {
    query =
      scope.clientId === null || scope.clientId === undefined
        ? query.is("client_id", null)
        : query.eq("client_id", scope.clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) throw new VoiceGuideMissingError();
  return data.map((row) => row.content).join("\n\n");
}

function buildSystemPrompt(
  voice: string,
  pillarLabel: string,
  pillarDescription: string,
  pillarFunnelRole: string,
  hookValue: HookType,
  funnelValue: FunnelStage,
): string {
  const hook = HOOK_TYPES.find((h) => h.value === hookValue)!;
  const funnel = FUNNEL_STAGES.find((f) => f.value === funnelValue)!;

  return `${PERSONA_SYSTEM_PROMPT}

---

${voice}

---

## This Specific Post

**Content pillar:** ${pillarLabel}
${pillarDescription}
Funnel role for this pillar: ${pillarFunnelRole}

**Hook type:** ${hook.label} — ${hook.description}

**Funnel stage:** ${funnel.label}
${funnel.description}

---

## Output Constraint

Return ONLY the LinkedIn post body. No preamble. No meta-commentary. No "Here's your post:". No explanation of choices. No summary at the end. No hashtags unless they emerge naturally from the thought. Write the post as if you're publishing it directly to LinkedIn. Stop when the post is complete.`;
}

function buildUserMessage(
  input: GenerateInput,
  fetchedSource: string | null,
): string {
  if (fetchedSource) {
    const extra = input.sourceMaterial
      ? `\n\nAdditional context from the user:\n${input.sourceMaterial}`
      : "";
    return `Draft a LinkedIn post inspired by the content below.

<source-content>
${fetchedSource}
</source-content>${extra}

The source is a starting point, not something to summarize. Find the angle that fits the selected pillar, hook, and funnel stage.`;
  }

  if (input.sourceUrl) {
    // Anthropic path: model fetches the URL via web_fetch tool.
    const extra = input.sourceMaterial
      ? `\n\nAdditional context from the user:\n${input.sourceMaterial}`
      : "";
    return `Draft a LinkedIn post inspired by this URL. Use the web_fetch tool to read the content first, then write the post.\n\nURL: ${input.sourceUrl}${extra}`;
  }

  if (input.sourceMaterial) {
    return `Draft a LinkedIn post inspired by this source material:\n\n<source>\n${input.sourceMaterial}\n</source>\n\nThe source is a starting point, not something to summarize. Find the angle that fits the selected pillar, hook, and funnel stage.`;
  }

  return "Draft a LinkedIn post from scratch. Use the pillar, hook, and funnel stage guidance in the system prompt to pick an angle drawn from your own knowledge and reasoning.";
}

export function assembleSourceContext(idea: {
  raw_insight: string;
  source: string;
  source_material?: string | null;
  source_metadata?: Record<string, unknown> | null;
}): string {
  const parts: string[] = [idea.raw_insight];
  const meta = idea.source_metadata;

  if (meta && Object.keys(meta).length > 0) {
    if (meta.title) parts.push(`Title: ${meta.title}`);
    if (Array.isArray(meta.authors) && meta.authors.length > 0) {
      parts.push(`Authors: ${(meta.authors as string[]).join(", ")}`);
    }
    if (meta.summary) parts.push(`Summary:\n${meta.summary}`);
    if (Array.isArray(meta.key_takeaways) && meta.key_takeaways.length > 0) {
      const takeaways = meta.key_takeaways as string[];
      parts.push(
        `Key takeaways:\n${takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      );
    }
    if (Array.isArray(meta.chapters) && meta.chapters.length > 0) {
      const chapters = meta.chapters as { title: string }[];
      parts.push(
        `Chapters/sections:\n${chapters.map((c) => `- ${c.title}`).join("\n")}`,
      );
    }
    if (Array.isArray(meta.entities) && meta.entities.length > 0) {
      const entities = meta.entities as { name: string; type: string }[];
      parts.push(
        `Key entities:\n${entities.map((e) => `- ${e.name} (${e.type})`).join("\n")}`,
      );
    }
    if (meta.table_of_contents && Array.isArray(meta.table_of_contents)) {
      const toc = meta.table_of_contents as string[];
      parts.push(`Table of contents:\n${toc.map((t) => `- ${t}`).join("\n")}`);
    }
    if (Array.isArray(meta.subjects) && meta.subjects.length > 0) {
      parts.push(`Subjects: ${(meta.subjects as string[]).join(", ")}`);
    }
  }

  if (idea.source_material) {
    parts.push(`Additional source material:\n${idea.source_material}`);
  }

  return parts.join("\n\n");
}

export async function generatePostDraft(
  input: GenerateInput,
): Promise<string> {
  const voice = await fetchVoicePrinciple(input.scope);
  const pillars = await getContentPillars(input.scope);
  const pillar = pillars.find((p) => p.slug === input.pillar);
  const systemPrompt = buildSystemPrompt(
    voice,
    pillar?.label || input.pillar,
    pillar?.description || "",
    pillar?.funnel_role || "",
    input.hookType,
    input.funnelStage,
  );

  const scope = input.scope ?? {};
  const resolved = await resolveLLMProvider(scope, "frontier");

  // On Anthropic, keep the native web_fetch tool + adaptive thinking flow.
  // On any other provider, pre-fetch the URL to markdown and stuff it.
  let fetchedSource: string | null = null;
  if (input.sourceUrl && resolved.provider !== "anthropic") {
    const fetched = await fetchUrlAsMarkdown(input.sourceUrl);
    fetchedSource = fetched.content;
  }

  const userMessage = buildUserMessage(input, fetchedSource);

  const tools =
    input.sourceUrl && resolved.provider === "anthropic"
      ? { web_fetch: anthropicProvider.tools.webFetch_20260209({}) }
      : undefined;

  const result = await opsGenerateText({
    scope,
    tier: "frontier",
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    tools,
    maxTokens: 16000,
    thinking:
      resolved.provider === "anthropic" ? { type: "adaptive" } : undefined,
  });

  const text = result.text.trim();
  if (!text) {
    throw new Error(
      `Model returned no text content (provider=${result.provider}, model=${result.modelId})`,
    );
  }
  return text;
}
