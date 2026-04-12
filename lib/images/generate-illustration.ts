import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { VISUAL_BRAND_BRIEF } from "@/lib/visual-brand-brief";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { generateWithFlux } from "@/lib/images/cloudflare-ai";

export interface GeneratedImage {
  base64: string;
  mediaType: string;
  prompt: string;
}

/**
 * Step 1: Claude writes a detailed image generation prompt based on the post
 * content, persona, and visual brand brief.
 */
async function generateImagePrompt(
  postBody: string,
  postTitle?: string | null,
  pillarLabel?: string | null,
  funnelStage?: string | null
): Promise<string> {
  const contextParts: string[] = [];
  if (postTitle) contextParts.push(`Post title: ${postTitle}`);
  if (pillarLabel) contextParts.push(`Content pillar: ${pillarLabel}`);
  if (funnelStage) contextParts.push(`Funnel stage: ${funnelStage}`);
  contextParts.push(`Post body:\n${postBody.slice(0, 1500)}`);

  const response = await getAnthropic().messages.create({
    model: SONNET_MODEL,
    max_tokens: 1000,
    system: `${PERSONA_SYSTEM_PROMPT}

---

${VISUAL_BRAND_BRIEF}

---

You are writing a text-to-image prompt for an AI image generator (Flux/Stable Diffusion).

Your job is to translate the LinkedIn post content into a single, detailed image generation prompt that produces an illustration matching the Hi-Low Studio visual brand.

Rules:
- Write ONE prompt, 150-300 words
- Describe the scene, composition, color palette, textures, and metaphor in concrete visual terms
- Use the brand palette: warm cream/off-white backgrounds, charcoal/dark walnut tones, clay/moss/terracotta accents
- Specify: risograph/letterpress texture, slight grain, hand-drawn quality
- Specify: minimalist composition, asymmetric balance, generous whitespace
- Use analog metaphors for digital concepts (compass, scaffolding, workshop bench, root systems, stacked stones)
- No corporate imagery (no handshakes, skyscrapers, stock-photo people)
- No text in the image
- Landscape format (wider than tall)
- Return ONLY the prompt text. No preamble, no explanation, no "Here's the prompt:"`,
    messages: [
      {
        role: "user",
        content: `Write an image generation prompt for this LinkedIn post:\n\n${contextParts.join("\n")}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text for image prompt");
  }

  return textBlock.text.trim();
}

/**
 * Two-step generation:
 * 1. Claude writes a brand-aligned image prompt
 * 2. Cloudflare Workers AI (Flux) generates the image
 */
export async function generatePostIllustration(
  postBody: string,
  postTitle?: string | null,
  pillarLabel?: string | null,
  funnelStage?: string | null
): Promise<GeneratedImage> {
  const imagePrompt = await generateImagePrompt(
    postBody,
    postTitle,
    pillarLabel,
    funnelStage
  );

  const imageBuffer = await generateWithFlux(imagePrompt);

  return {
    base64: imageBuffer.toString("base64"),
    mediaType: "image/png",
    prompt: imagePrompt,
  };
}
