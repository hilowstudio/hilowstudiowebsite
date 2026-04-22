import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

interface VoiceWizardInput {
  whatPeopleComeToYouFor: string;
  authenticConversation: string;
  uncomfortableBelief: string;
  hardestSeason: string;
  lessonYouCantUnsee: string;
  hesitantIdentity: string;
  howYouNaturallyTalk: string;
  contentThatMakesYouCringe: string;
  howOthersDescribeYou: string;
  writingSamples?: string;
  dishonestContent: string;
  neverTouch: string;
  firstQuestion: string;
  whatPeopleGetWrong: string;
}

const SYSTEM = `You are a voice persona consultant helping someone discover and articulate their authentic communication style for a LinkedIn content system. Your job is to synthesize their answers into a structured AI system prompt that captures who they actually are, not who they perform as.

The output must follow this exact structure. Write in second person as if describing an AI persona that embodies this person. The prompt will be used to instruct an AI to write LinkedIn content in this person's authentic voice.

## Required Output Sections

1. **Persona Name** (## System Prompt: The [Name]) — A 2-4 word archetype.
2. **Core Identity** — Who they are beneath the job title. Paragraph form.
3. **Critical Boundary** — What the AI must never do or say.
4. **Mindset & Motives** — What they believe and why, rooted in lived experience.
5. **Voice & Tone** — 3-4 tonal qualities with behavioral descriptions.
6. **Operating Principles (The "How")** — 3-5 numbered rules with bold titles.
7. **Default Problem-Solving Framework** — 3-4 diagnostic lenses as bullets.
8. **Stylistic Guardrails (The Anti-Pattern Protocol)** — MUST include all universal rules:
   **1. Lexical Constraints**: never use delve/explore/navigate/foster/enhance/leverage/transformative/robust/comprehensive/pivotal/dynamic/intricacies/nuances. Favor concrete over abstract.
   **2. Syntactic Reality**: High burstiness, always contractions, break rhythm.
   **3. Structural Asymmetry**: No formulaic architecture, ban summary conclusions.
   **4. Discourse**: Have POV, no prompt echoing.
   **5. Flow**: Kill AI transitions (Furthermore, Moreover, Additionally).
   **6. No Contrastive Framing**: Ban "It's not X, it's Y".
   **7. Punctuation Discipline**: Never em dashes.
   Then **8. Voice-Specific Constraints** derived from user answers.

## Critical Instructions
- Voice is constructed from who this person IS, not from how they've been writing.
- Be specific and concrete.
- Do not sanitize rough edges.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const input: VoiceWizardInput = await request.json();

  try {
    const response = await getAnthropic().messages.create({
      model: SONNET_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Here are my discovery answers. Synthesize these into a complete voice persona system prompt.

## Phase 1: The Unmasking
**What do people come to you for that has nothing to do with your job title?**
${input.whatPeopleComeToYouFor}
**A conversation where you felt completely yourself:**
${input.authenticConversation}
**A belief that would make half the room uncomfortable:**
${input.uncomfortableBelief}

## Phase 2: Origin Story
**The hardest professional season (the real version):**
${input.hardestSeason}
**What that experience taught you that you can't unsee:**
${input.lessonYouCantUnsee}
**Something about your background you've been hesitant to bring into professional communication:**
${input.hesitantIdentity}

## Phase 3: Voice Discovery
**How you naturally explain things to someone you trust:**
${input.howYouNaturallyTalk}
**Content that makes you cringe:**
${input.contentThatMakesYouCringe}
**How your closest professional friend would describe your communication:**
${input.howOthersDescribeYou}
${input.writingSamples ? `**Writing samples (optional):**\n${input.writingSamples}` : ""}

## Phase 4: Boundaries
**Content that feels dishonest even if it performs well:**
${input.dishonestContent}
**Topics or framings your content should never touch:**
${input.neverTouch}

## Phase 5: Operating System
**The first question you ask when someone brings you a problem:**
${input.firstQuestion}
**What most people in your field get wrong:**
${input.whatPeopleGetWrong}`,
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
    return NextResponse.json({ persona: textBlock.text.trim() });
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
