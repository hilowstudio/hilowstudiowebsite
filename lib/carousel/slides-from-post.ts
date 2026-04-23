import { supabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { opsGenerateObject } from "@/lib/ops/llm";
import { slidesSchema } from "@/lib/ai/schemas";

export interface CarouselSlide {
  heading: string;
  body: string;
}

async function fetchVoicePrinciple(
  workspaceId?: string | null,
  clientId?: string | null,
): Promise<string> {
  let query = supabase
    .from("voice_guide")
    .select("content, workspace_id, client_id")
    .eq("category", "principle")
    .order("sort_order", { ascending: true });

  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  if (clientId !== undefined) {
    query =
      clientId === null
        ? query.is("client_id", null)
        : query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return "";
  return data.map((row) => row.content).join("\n\n");
}

export async function structureIntoSlides(
  postBody: string,
  title?: string | null,
  scope?: { workspaceId?: string | null; clientId?: string | null },
): Promise<CarouselSlide[]> {
  const voice = await fetchVoicePrinciple(scope?.workspaceId, scope?.clientId);

  const systemPrompt = `${PERSONA_SYSTEM_PROMPT}

---

${voice}

---

You are structuring a LinkedIn post into carousel slides (PDF document post).

1. Break the content into 5-10 slides.
2. Each slide: a short heading (5-10 words max) and a body (1-3 sentences max).
3. First slide: strong hook/title slide.
4. Last slide: CTA slide (e.g., "Follow for more", "What do you think?").
5. ALL text must follow the voice and style rules above. Critical.
6. Return structured output matching the provided schema.`;

  const result = await opsGenerateObject({
    scope: scope ?? {},
    tier: "fast",
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Break this LinkedIn post into carousel slides:\n\n${title ? `Title: ${title}\n\n` : ""}${postBody}`,
      },
    ],
    maxTokens: 4000,
    schema: slidesSchema,
  });

  if (!result.object.slides || result.object.slides.length < 2) {
    throw new Error("Invalid slide structure returned");
  }
  return result.object.slides;
}
