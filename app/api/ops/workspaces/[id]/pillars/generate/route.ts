import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

interface WizardInput {
  unscripted: string;
  frustration: string;
  unfairAdvantage: string;
  audiencePains: string;
  transformationBridge: string;
  realQuestions: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const input: WizardInput = await request.json();

  try {
    const response = await getAnthropic().messages.create({
      model: SONNET_MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: `${PERSONA_SYSTEM_PROMPT}

---

You are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars.

A viable content pillar must sit at the intersection of three things:
1. The person is an expert at it.
2. Their audience cares about it.
3. It logically leads back to their business.

The standard 5-pillar structure:
- Pillar 1: Core Competency — tactical/strategic advice
- Pillar 2: Industry Worldview — thought leadership, contrarian takes
- Pillar 3: Journey / Build in Public — behind-the-scenes
- Pillar 4: Audience Mindset / Soft Skills — empathy
- Pillar 5: Tangential / Personal Passion — relatability

Recommend 3, 4, or 5 pillars. Only recommend what the data supports.

For each pillar provide:
- label: Compelling specific name
- shortLabel: 2-3 words
- description: 1-2 sentences
- funnelRole: e.g., "TOFU primary", "MOFU to BOFU bridge"

Return ONLY valid JSON: { "pillars": [...] }
No markdown, no explanation, no preamble.`,
      messages: [
        {
          role: "user",
          content: `Here are my discovery answers. Synthesize these into 3-5 content pillars.

**What I could speak about for 45 minutes with no prep:**
${input.unscripted}

**Bad advice in my industry that drives me crazy:**
${input.frustration}

**My unfair advantage:**
${input.unfairAdvantage}

**Top 3 problems my ideal client is trying to solve:**
${input.audiencePains}

**What my audience needs to believe to be ready to buy:**
${input.transformationBridge}

**What people actually ask me on calls, in comments, and DMs:**
${input.realQuestions}`,
        },
      ],
    });

    const textBlock = response.content.findLast((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);
    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI error (${err.status}): ${err.message}` },
        { status: 502 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
