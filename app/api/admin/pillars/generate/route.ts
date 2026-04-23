import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { opsGenerateObject } from "@/lib/ops/llm";
import { pillarsSchema } from "@/lib/ai/schemas";

interface WizardInput {
  unscripted: string;
  frustration: string;
  unfairAdvantage: string;
  audiencePains: string;
  transformationBridge: string;
  realQuestions: string;
}

const SYSTEM_PROMPT = `${PERSONA_SYSTEM_PROMPT}

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

Recommend 3, 4, or 5 pillars. Only recommend what the data supports.`;

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input: WizardInput = await request.json();

  try {
    const result = await opsGenerateObject({
      scope: {},
      tier: "strong",
      system: SYSTEM_PROMPT,
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
      schema: pillarsSchema,
      maxTokens: 4000,
      thinking: { type: "adaptive" },
    });
    return NextResponse.json(result.object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
