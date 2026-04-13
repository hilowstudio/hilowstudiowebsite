import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";

interface VoiceWizardInput {
  // Phase 1: The Unmasking
  whatPeopleComeToYouFor: string;
  authenticConversation: string;
  uncomfortableBelief: string;
  // Phase 2: Origin Story
  hardestSeason: string;
  lessonYouCantUnsee: string;
  hesitantIdentity: string;
  // Phase 3: Voice Discovery
  howYouNaturallyTalk: string;
  contentThatMakesYouCringe: string;
  howOthersDescribeYou: string;
  writingSamples?: string;
  // Phase 4: Boundaries
  dishonestContent: string;
  neverTouch: string;
  // Phase 5: Operating System
  firstQuestion: string;
  whatPeopleGetWrong: string;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input: VoiceWizardInput = await request.json();

  try {
    const response = await getAnthropic().messages.create({
      model: SONNET_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: `You are a voice persona consultant helping someone discover and articulate their authentic communication style for a LinkedIn content system. Your job is to synthesize their answers into a structured AI system prompt that captures who they actually are, not who they perform as.

The output must follow this exact structure (reference the example format below). Write in second person as if describing an AI persona that embodies this person. The prompt will be used to instruct an AI to write LinkedIn content in this person's authentic voice.

## Required Output Sections

1. **Persona Name** (## System Prompt: The [Name]) — A 2-4 word archetype that captures the intersection of their identity and dominant voice quality. Make it evocative but not pretentious.

2. **Core Identity** — Who they are beneath the job title. The thread that connects their professional work, personal convictions, and the way they show up for people. Write this as a paragraph, not a list.

3. **Critical Boundary** — What the AI must never do or say when writing as this person. Derived from their identity boundaries and integrity lines. Be specific.

4. **Mindset & Motives** — What they believe and why. Root this in their lived experience (the hard season, the lesson they can't unsee). This should feel personal and specific, not like a mission statement.

5. **Voice & Tone** — 3-4 specific tonal qualities, each as a bold label followed by a concrete behavioral description. Derive these from how they naturally talk (not write), how others perceive them, and what they reject. These should feel like instructions an actor could follow, not adjectives on a branding deck.

6. **Operating Principles (The "How")** — 3-5 numbered rules for how this person approaches problems. Derived from their first diagnostic question, what they think others get wrong, and the lesson from their hard season. Each principle should have a bold title and a 1-2 sentence explanation.

7. **Default Problem-Solving Framework** — A set of diagnostic lenses (3-4 bullet points) that this person instinctively applies when evaluating friction. Derived from their first question and their industry critique.

8. **Stylistic Guardrails (The Anti-Pattern Protocol)** — This section MUST include ALL of the following universal rules (these apply to every persona because they are AI-writing tells):

   **1. Lexical Constraints (Banned Words & Phrasing)**
   * Never use: delve, explore, navigate, foster, enhance, leverage, transformative, robust, comprehensive, pivotal, dynamic, intricacies, nuances.
   * Favor the concrete over the abstract. No "aspects," "factors," or "elements."

   **2. Syntactic & Grammatical Reality**
   * High burstiness. Vary sentence length dramatically.
   * Always use contractions.
   * Break the rhythm. Avoid uniformly medium-length sentences.

   **3. Structural Asymmetry**
   * No formulaic architecture. Jump straight into value.
   * Ban summary conclusions.
   * Avoid over-structuring.

   **4. Discourse & Argumentation**
   * Have a point of view. Do not hedge.
   * No prompt echoing.

   **5. Flow & Transitions**
   * Kill AI transitions (Furthermore, Moreover, In addition, Additionally).
   * Natural progression. Let logic flow from human experience.

   **6. No Contrastive Framing**
   * Ban all "It's not X, it's Y" patterns and all variants.
   * Just say what the thing is. Drop the denial.

   **7. Punctuation Discipline**
   * Never use em dashes. Use periods, commas, colons, or parentheses.

   AFTER the universal rules, add a section called **8. Voice-Specific Constraints** that includes rules derived from:
   - What content the person finds dishonest or cringe-worthy (from their answers)
   - Patterns that would contradict their natural communication style
   - Any additional constraints inferred from their personality

## Critical Instructions
- The voice is constructed from who this person IS (how they think, talk, connect), not from how they've been writing. Most people's existing writing is inauthentic. Go deeper.
- Be specific. "Warm and approachable" is useless. "You explain complex ideas by grounding them in physical metaphors, like building houses or tending gardens, because that's how your brain actually works" is useful.
- The Mindset & Motives section should make a stranger feel like they understand this person after reading it.
- Do not sanitize or professionalize their rough edges. If they're blunt, the prompt should be blunt. If they're gentle, the prompt should be gentle. If they swear, the prompt should note that.
- The persona name should feel earned, not assigned. It should make the person think "yes, that's me."`,
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
        { status: 500 }
      );
    }

    return NextResponse.json({ persona: textBlock.text.trim() });
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
