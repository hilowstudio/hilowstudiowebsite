"use client";

import { useState } from "react";
import { ProcessingBanner } from "@/components/processing-banner";

type Step =
  | "intro"
  | "unmasking"
  | "origin"
  | "voice"
  | "boundaries"
  | "operating"
  | "generate"
  | "review";

function QuestionBlock({
  label,
  guidance,
  value,
  onChange,
  rows = 4,
  optional = false,
}: {
  label: string;
  guidance: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
        {label}
        {optional && (
          <span className="font-normal text-ink-light ml-1">(optional)</span>
        )}
      </label>
      <p className="text-xs text-ink-light mb-2">{guidance}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
      />
    </div>
  );
}

function NavButtons({
  back,
  next,
  nextLabel = "Next",
  nextDisabled = false,
}: {
  back: () => void;
  next: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={back}
        className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink"
      >
        Back
      </button>
      <button
        onClick={next}
        disabled={nextDisabled}
        className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export type VoiceWizardUrls = {
  generatePersonaUrl: string;
  listVoiceUrl: string;
  createVoiceUrl: string;
  voiceItemUrl: (id: string) => string;
};

export const ADMIN_VOICE_URLS: VoiceWizardUrls = {
  generatePersonaUrl: "/api/admin/voice/generate-persona",
  listVoiceUrl: "/api/admin/voice",
  createVoiceUrl: "/api/admin/voice",
  voiceItemUrl: (id) => `/api/admin/voice/${id}`,
};

export function VoiceWizard({
  onComplete,
  urls = ADMIN_VOICE_URLS,
}: {
  onComplete: () => void;
  urls?: VoiceWizardUrls;
}) {
  const [step, setStep] = useState<Step>("intro");

  // Phase 1
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  // Phase 2
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  // Phase 3
  const [q7, setQ7] = useState("");
  const [q8, setQ8] = useState("");
  const [q9, setQ9] = useState("");
  const [q7b, setQ7b] = useState("");
  // Phase 4
  const [q10, setQ10] = useState("");
  const [q11, setQ11] = useState("");
  // Phase 5
  const [q12, setQ12] = useState("");
  const [q13, setQ13] = useState("");

  const [generatedPersona, setGeneratedPersona] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(urls.generatePersonaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatPeopleComeToYouFor: q1,
          authenticConversation: q2,
          uncomfortableBelief: q3,
          hardestSeason: q4,
          lessonYouCantUnsee: q5,
          hesitantIdentity: q6,
          howYouNaturallyTalk: q7,
          contentThatMakesYouCringe: q8,
          howOthersDescribeYou: q9,
          writingSamples: q7b.trim() || undefined,
          dishonestContent: q10,
          neverTouch: q11,
          firstQuestion: q12,
          whatPeopleGetWrong: q13,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      setGeneratedPersona(data.persona);
      setStep("review");
    } catch {
      setError("Generation failed");
    }
    setGenerating(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    // Delete existing principle rows
    const listRes = await fetch(urls.listVoiceUrl);
    if (listRes.ok) {
      const entries = await listRes.json();
      for (const entry of entries) {
        if (entry.category === "principle") {
          await fetch(urls.voiceItemUrl(entry.id), { method: "DELETE" });
        }
      }
    }

    // Save the new persona as a principle entry
    const res = await fetch(urls.createVoiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "principle",
        content: generatedPersona,
        sort_order: 0,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Save failed");
      setSaving(false);
      return;
    }

    setSaving(false);
    onComplete();
  }

  // ─── Intro ──────────────────────────────────────────────

  if (step === "intro") {
    return (
      <div className="space-y-5">
        <h2 className="font-serif text-xl text-ink">
          Discover Your Authentic Voice
        </h2>
        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            Most people on LinkedIn operate from one of two masks.
          </p>
          <p>
            The first is the <strong className="text-ink">brash mask</strong>: provocative,
            divisive, antagonistic. Authenticity weaponized as permission to not
            care what anyone thinks.
          </p>
          <p>
            The second is the{" "}
            <strong className="text-ink">polished mask</strong>: corporate,
            calculated, curated for approval. Safety mistaken for integrity.
          </p>
          <p>
            Both are performances. This exercise helps you find the voice that
            exists when you stop performing. The one your friends hear. The one
            that makes people lean in, not scroll past.
          </p>
          <p>
            The questions ahead will feel different from a branding exercise.
            They're designed to bypass both masks. Answer as honestly as you
            can. There are no wrong answers, only authentic ones.
          </p>
          <p className="text-xs text-ink-light">
            Takes about 15 minutes. Your answers are private and used only to
            generate your voice prompt.
          </p>
        </div>
        <button
          onClick={() => setStep("unmasking")}
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors"
        >
          Begin Discovery
        </button>
      </div>
    );
  }

  // ─── Phase 1: The Unmasking ─────────────────────────────

  if (step === "unmasking") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">
            Phase 1: Who Are You, Really?
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Forget the LinkedIn headline. These questions are about the person
            underneath.
          </p>
        </div>
        <div className="space-y-5">
          <QuestionBlock
            label="What do people come to you for that has nothing to do with your job title?"
            guidance="Think about the role you play in people's lives beyond your professional work. Are you the person who calms things down? The one who sees the pattern no one else sees? The one people call when they're stuck?"
            value={q1}
            onChange={setQ1}
          />
          <QuestionBlock
            label="Think of a conversation where you felt completely yourself. What were you talking about, and who were you talking to?"
            guidance="Not a presentation. Not a pitch. A real conversation where you weren't editing yourself. What was the topic? What made that conversation feel different?"
            value={q2}
            onChange={setQ2}
          />
          <QuestionBlock
            label="What do you believe about your industry that would make half the room uncomfortable if you said it at a conference?"
            guidance="The thing you actually think, not the safe version. The belief that shapes how you work but that you've learned to soften for polite company."
            value={q3}
            onChange={setQ3}
          />
        </div>
        <NavButtons
          back={() => setStep("intro")}
          next={() => setStep("origin")}
          nextLabel="Next: Your Origin Story"
          nextDisabled={!q1.trim() || !q2.trim() || !q3.trim()}
        />
      </div>
    );
  }

  // ─── Phase 2: Origin Story ──────────────────────────────

  if (step === "origin") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">
            Phase 2: The Wound and the Wisdom
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Every compelling voice is rooted in a specific experience. The
            polished version of your story is not what we're looking for. We
            need the real one.
          </p>
        </div>
        <div className="space-y-5">
          <QuestionBlock
            label="What's the hardest professional season you've been through?"
            guidance="Not the resume version. The version you'd tell a close friend over a drink. What actually happened, what it cost you, and what it felt like from the inside."
            value={q4}
            onChange={setQ4}
            rows={5}
          />
          <QuestionBlock
            label="What did that experience teach you that you now can't unsee?"
            guidance="The lens it gave you. The thing you notice in every room, every system, every conversation that other people miss because they haven't lived through what you have."
            value={q5}
            onChange={setQ5}
          />
          <QuestionBlock
            label="Is there anything about your background or identity that you've kept separate from your professional communication?"
            guidance="Maybe it's a diagnosis, a faith tradition, a non-traditional path, a class background, a personal struggle. Something real about you that you've been filtering out of your public voice."
            value={q6}
            onChange={setQ6}
          />
        </div>
        <NavButtons
          back={() => setStep("unmasking")}
          next={() => setStep("voice")}
          nextLabel="Next: Your Voice"
          nextDisabled={!q4.trim() || !q5.trim() || !q6.trim()}
        />
      </div>
    );
  }

  // ─── Phase 3: Voice Discovery ───────────────────────────

  if (step === "voice") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">
            Phase 3: How You Actually Sound
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Your voice already exists in how you think, talk, and connect. We're
            looking for the patterns that come out when you stop writing for an
            audience.
          </p>
        </div>
        <div className="space-y-5">
          <QuestionBlock
            label="When you're explaining something you care about to someone you trust, what does that sound like?"
            guidance="Are you the person who uses analogies? Tells stories? Gets straight to the point? Asks questions back? Think about the last time you were on the phone with a friend explaining something that mattered to you."
            value={q7}
            onChange={setQ7}
          />
          <QuestionBlock
            label="What type of content do you see on LinkedIn or social media that makes you cringe, even when it performs well?"
            guidance="Be specific. Is it the fake vulnerability posts? The humble-brags? The hot-take format? The corporate jargon? The 'I'm so grateful' posts? What exactly about it bothers you?"
            value={q8}
            onChange={setQ8}
          />
          <QuestionBlock
            label="How would your closest professional friend describe the way you communicate when you're in your element?"
            guidance="Not 'what you're like as a person' but specifically how you talk. Do you tell stories? Get quiet and then drop one sentence that reframes everything? Pace around the room? Draw on whiteboards?"
            value={q9}
            onChange={setQ9}
          />
          <QuestionBlock
            label="Writing samples"
            guidance="If you have any writing you're proud of (posts, emails, Slack messages, anything where you thought 'that sounds like me'), paste it here. This is completely optional. The wizard works without it."
            value={q7b}
            onChange={setQ7b}
            optional={true}
            rows={5}
          />
        </div>
        <NavButtons
          back={() => setStep("origin")}
          next={() => setStep("boundaries")}
          nextLabel="Next: Your Boundaries"
          nextDisabled={!q7.trim() || !q8.trim() || !q9.trim()}
        />
      </div>
    );
  }

  // ─── Phase 4: Boundaries ────────────────────────────────

  if (step === "boundaries") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">
            Phase 4: What You'll Never Do
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Your boundaries protect your authenticity. These constraints are as
            important as your voice itself.
          </p>
        </div>
        <div className="space-y-5">
          <QuestionBlock
            label="What type of content feels dishonest to you, even if it performs well?"
            guidance="The patterns you see working for other people that you could never do yourself without feeling like a fraud. This becomes a rule your AI will follow."
            value={q10}
            onChange={setQ10}
          />
          <QuestionBlock
            label="Is there a topic, audience, or framing that your content should never touch?"
            guidance="Some people have religious, political, or personal lines. Some have professional ones ('I will never trash a competitor by name'). What would compromise your integrity if you published it?"
            value={q11}
            onChange={setQ11}
          />
        </div>
        <NavButtons
          back={() => setStep("voice")}
          next={() => setStep("operating")}
          nextLabel="Next: How You Think"
          nextDisabled={!q10.trim() || !q11.trim()}
        />
      </div>
    );
  }

  // ─── Phase 5: Operating System ──────────────────────────

  if (step === "operating") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">
            Phase 5: Your Operating System
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            How you instinctively approach problems reveals more about your voice
            than any adjective could.
          </p>
        </div>
        <div className="space-y-5">
          <QuestionBlock
            label="When someone brings you a problem in your area of expertise, what's the first question you ask them?"
            guidance="Not the first thing you say. The first thing you need to know. The question that reveals whether you're dealing with a surface problem or a root cause."
            value={q12}
            onChange={setQ12}
          />
          <QuestionBlock
            label="What do most people in your field get wrong about solving problems in your domain?"
            guidance="The common mistake. The assumption that drives you crazy. The thing you wish everyone understood before they tried to fix anything."
            value={q13}
            onChange={setQ13}
          />
        </div>
        <NavButtons
          back={() => setStep("boundaries")}
          next={() => {
            setStep("generate");
            handleGenerate();
          }}
          nextLabel="Generate My Voice"
          nextDisabled={!q12.trim() || !q13.trim()}
        />
      </div>
    );
  }

  // ─── Generating ─────────────────────────────────────────

  if (step === "generate") {
    return (
      <div className="space-y-6">
        <h2 className="font-serif text-xl text-ink">
          Building Your Voice Persona
        </h2>
        {generating && (
          <ProcessingBanner
            message="Synthesizing your voice..."
            submessage="AI is processing your answers to construct a detailed voice persona that captures who you actually are, not who you perform as."
          />
        )}
        {error && (
          <div className="space-y-3">
            <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
              {error}
            </div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Review ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-ink">Your Voice Persona</h2>
        <p className="text-sm text-ink-muted mt-1">
          Review and edit. This prompt will guide every piece of content the AI
          generates for you. Make sure it sounds like the real you.
        </p>
      </div>

      <div className="rounded-lg border border-paper-muted bg-paper-warm/30 p-4">
        <textarea
          value={generatedPersona}
          onChange={(e) => setGeneratedPersona(e.target.value)}
          rows={30}
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-clay resize-y"
        />
      </div>

      {error && (
        <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setStep("operating")}
          className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink"
        >
          Back to questions
        </button>
        <button
          onClick={() => {
            setStep("generate");
            handleGenerate();
          }}
          disabled={generating}
          className="px-4 py-2 rounded-md border border-clay text-clay text-sm hover:bg-clay hover:text-paper transition-colors disabled:opacity-50"
        >
          Regenerate
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !generatedPersona.trim()}
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Voice Persona"}
        </button>
      </div>
    </div>
  );
}
