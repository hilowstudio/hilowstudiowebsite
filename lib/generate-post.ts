import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import {
  CONTENT_PILLARS,
  HOOK_TYPES,
  FUNNEL_STAGES,
} from "@/lib/content-strategy";
import type {
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

export interface GenerateInput {
  pillar: ContentPillar;
  hookType: HookType;
  funnelStage: FunnelStage;
  sourceMaterial?: string;
  sourceUrl?: string;
}

export class VoiceGuideMissingError extends Error {
  constructor() {
    super(
      "No voice guide principle found. Add a 'principle' row to voice_guide before generating."
    );
    this.name = "VoiceGuideMissingError";
  }
}

async function fetchVoicePrinciple(): Promise<string> {
  const { data, error } = await supabase
    .from("voice_guide")
    .select("content")
    .eq("category", "principle")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) throw new VoiceGuideMissingError();

  return data.map((row) => row.content).join("\n\n");
}

function buildSystemPrompt(
  voice: string,
  pillarValue: ContentPillar,
  hookValue: HookType,
  funnelValue: FunnelStage
): string {
  const pillar = CONTENT_PILLARS.find((p) => p.value === pillarValue)!;
  const hook = HOOK_TYPES.find((h) => h.value === hookValue)!;
  const funnel = FUNNEL_STAGES.find((f) => f.value === funnelValue)!;

  return `${voice}

---

## This Specific Post

**Content pillar:** ${pillar.label}
${pillar.description}
Funnel role for this pillar: ${pillar.funnelRole}

**Hook type:** ${hook.label} — ${hook.description}

**Funnel stage:** ${funnel.label}
${funnel.description}

---

## Output Constraint

Return ONLY the LinkedIn post body. No preamble. No meta-commentary. No "Here's your post:". No explanation of choices. No summary at the end. No hashtags unless they emerge naturally from the thought. Write the post as if you're publishing it directly to LinkedIn. Stop when the post is complete.`;
}

function buildUserMessage(input: GenerateInput): string {
  if (input.sourceUrl) {
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
        `Key takeaways:\n${takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      );
    }
    if (Array.isArray(meta.chapters) && meta.chapters.length > 0) {
      const chapters = meta.chapters as { title: string }[];
      parts.push(
        `Chapters/sections:\n${chapters.map((c) => `- ${c.title}`).join("\n")}`
      );
    }
    if (Array.isArray(meta.entities) && meta.entities.length > 0) {
      const entities = meta.entities as { name: string; type: string }[];
      parts.push(
        `Key entities:\n${entities.map((e) => `- ${e.name} (${e.type})`).join("\n")}`
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
  input: GenerateInput
): Promise<string> {
  const voice = await fetchVoicePrinciple();
  const systemPrompt = buildSystemPrompt(
    voice,
    input.pillar,
    input.hookType,
    input.funnelStage
  );
  const userMessage = buildUserMessage(input);

  const response = await getAnthropic().messages.create({
    model: SONNET_MODEL,
    // High ceiling: adaptive thinking consumes tokens before the text block is
    // written. 2000 was too tight and hit max_tokens mid-thinking with no final
    // text. 16000 is the SDK-recommended non-streaming default.
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    tools: input.sourceUrl
      ? [{ type: "web_fetch_20260209", name: "web_fetch" }]
      : undefined,
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract the final text block (skip thinking and tool_use blocks)
  const textBlocks = response.content.filter(
    (b): b is Extract<typeof b, { type: "text" }> => b.type === "text"
  );
  const finalText = textBlocks[textBlocks.length - 1];

  if (!finalText || !finalText.text.trim()) {
    if (response.stop_reason === "max_tokens") {
      throw new Error(
        "Claude ran out of tokens before producing the post. Raise max_tokens in lib/generate-post.ts or retry."
      );
    }
    throw new Error(
      `Claude returned no text content (stop_reason: ${response.stop_reason})`
    );
  }

  return finalText.text.trim();
}
