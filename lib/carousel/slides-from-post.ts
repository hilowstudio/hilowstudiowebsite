import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";

export interface CarouselSlide {
  heading: string;
  body: string;
}

export async function structureIntoSlides(
  postBody: string,
  title?: string | null
): Promise<CarouselSlide[]> {
  const response = await getAnthropic().messages.create({
    model: SONNET_MODEL,
    max_tokens: 4000,
    system: `You are a LinkedIn carousel designer. Break the given post content into 5-10 slides for a carousel (PDF document post). Each slide should have a short heading (5-10 words max) and a body (1-3 sentences max). The first slide should be a strong hook/title slide. The last slide should be a CTA slide. Return ONLY valid JSON: an array of objects with "heading" and "body" fields. No markdown, no explanation.`,
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

  // Parse JSON from the response, handling potential markdown code blocks
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
