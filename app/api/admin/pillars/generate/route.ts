import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";

interface WizardInput {
  unscripted: string;
  frustration: string;
  unfairAdvantage: string;
  audiencePains: string;
  transformationBridge: string;
  realQuestions: string;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input: WizardInput = await request.json();

  try {
    const response = await getAnthropic().messages.create({
      model: SONNET_MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: `${PERSONA_SYSTEM_PROMPT}

---

You are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars. You have been given their answers to a strategic discovery process.

A viable content pillar must sit at the intersection of three things:
1. The person is an expert at it.
2. Their audience cares about it.
3. It logically leads back to their business.

The standard structure for 5 pillars is:
- Pillar 1: Core Competency (the "what you do") — direct tactical or strategic advice
- Pillar 2: Industry Worldview (the "how you think") — thought leadership, contrarian takes, trend analysis
- Pillar 3: Journey / Build in Public (the "proof of work") — behind-the-scenes, lessons, scaling stories
- Pillar 4: Audience Mindset / Soft Skills (the "empathy") — psychological roadblocks, daily grind, human side
- Pillar 5: Tangential / Personal Passion (the "relatability") — a personal interest that humanizes and makes memorable

You may recommend 3, 4, or 5 pillars. Only recommend what the data supports. Do not invent pillars that aren't grounded in the user's answers.

For each pillar, provide:
- label: A compelling, specific name (not generic like "Leadership Thoughts")
- shortLabel: 2-3 word abbreviation
- description: 1-2 sentences explaining what this pillar covers and why it matters
- funnelRole: Which part of the marketing funnel this pillar primarily serves (e.g., "TOFU primary", "MOFU to BOFU bridge")

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

**My unfair advantage (unique experiences, data, or frameworks):**
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
        { status: 500 }
      );
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI error (${err.status}): ${err.message}` },
        { status: 502 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
