import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";

export interface CarouselSlide {
  heading: string;
  body: string;
}

async function fetchVoicePrinciple(): Promise<string> {
  const { data, error } = await supabase
    .from("voice_guide")
    .select("content")
    .eq("category", "principle")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return "";

  return data.map((row) => row.content).join("\n\n");
}

export async function structureIntoSlides(
  postBody: string,
  title?: string | null
): Promise<CarouselSlide[]> {
  const voice = await fetchVoicePrinciple();

  const systemPrompt = `${PERSONA_SYSTEM_PROMPT}

---

${voice}

---

You are structuring a LinkedIn post into carousel slides (PDF document post). Your task:

1. Break the content into 5-10 slides
2. Each slide: a short heading (5-10 words max) and a body (1-3 sentences max)
3. First slide: strong hook/title slide
4. Last slide: CTA slide (e.g., "Follow for more", "What do you think?", or similar)
5. ALL text must follow the voice and style rules above. This is critical.
6. Return ONLY valid JSON: an array of objects with "heading" and "body" fields
7. No markdown, no explanation, no preamble. Just the JSON array.`;

  const response = await getAnthropic().messages.create({
    model: SONNET_MODEL,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Break this LinkedIn post into carousel slides:\n\n${title ? `Title: ${title}\n\n` : ""}${postBody}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude for slide structuring");
  }

  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const slides = JSON.parse(jsonStr) as CarouselSlide[];

  if (!Array.isArray(slides) || slides.length < 2) {
    throw new Error("Invalid slide structure returned");
  }

  return slides;
}
