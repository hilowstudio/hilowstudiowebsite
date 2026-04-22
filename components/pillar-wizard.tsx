"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessingBanner } from "@/components/processing-banner";

const PILLAR_COLORS = [
  "bg-moss/15 text-moss",
  "bg-clay/15 text-clay",
  "bg-ink/10 text-ink",
  "bg-terracotta/15 text-terracotta",
  "bg-clay-muted/20 text-clay",
];

interface WizardPillar {
  label: string;
  shortLabel: string;
  description: string;
  funnelRole: string;
}

type Step = "intro" | "internal" | "external" | "generate" | "review";

export type PillarWizardUrls = {
  generateUrl: string;
  saveUrl: string;
};

export const ADMIN_PILLAR_URLS: PillarWizardUrls = {
  generateUrl: "/api/admin/pillars/generate",
  saveUrl: "/api/admin/pillars",
};

export function PillarWizard({
  onComplete,
  urls = ADMIN_PILLAR_URLS,
}: {
  onComplete: () => void;
  urls?: PillarWizardUrls;
}) {
  const [step, setStep] = useState<Step>("intro");

  // Phase 1: Internal audit
  const [unscripted, setUnscripted] = useState("");
  const [frustration, setFrustration] = useState("");
  const [unfairAdvantage, setUnfairAdvantage] = useState("");

  // Phase 2: External audit
  const [audiencePains, setAudiencePains] = useState("");
  const [transformationBridge, setTransformationBridge] = useState("");
  const [realQuestions, setRealQuestions] = useState("");

  // Phase 3: AI-generated pillars
  const [generatedPillars, setGeneratedPillars] = useState<WizardPillar[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 4: Review and edit
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(urls.generateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unscripted,
          frustration,
          unfairAdvantage,
          audiencePains,
          transformationBridge,
          realQuestions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      const data = await res.json();
      setGeneratedPillars(data.pillars);
      setStep("review");
    } catch {
      setError("Generation failed");
    }
    setGenerating(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const pillars = generatedPillars.map((p, i) => ({
      slug: p.shortLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, ""),
      label: p.label,
      short_label: p.shortLabel,
      description: p.description,
      funnel_role: p.funnelRole,
      color_class: PILLAR_COLORS[i % PILLAR_COLORS.length],
      sort_order: i,
    }));

    const res = await fetch(urls.saveUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pillars),
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

  function removePillar(index: number) {
    if (generatedPillars.length <= 3) return;
    setGeneratedPillars((prev) => prev.filter((_, i) => i !== index));
  }

  // ─── Intro ──────────────────────────────────────────────

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Define Your Content Pillars</h2>
          <p className="text-sm text-ink-muted">
            Content pillars are the 3-5 core topics that anchor your entire
            LinkedIn presence. Every post you publish should connect back to one
            of them.
          </p>
          <p className="text-sm text-ink-muted">
            This wizard will guide you through a strategic discovery process to
            find the intersection of your deep expertise, your audience's most
            urgent needs, and your business objectives.
          </p>
          <p className="text-sm text-ink-muted">
            It takes about 10 minutes. Answer honestly. The AI will synthesize
            your answers into 3-5 recommended pillars that you can edit before
            saving.
          </p>
        </div>
        <button
          onClick={() => setStep("internal")}
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors"
        >
          Begin Discovery
        </button>
      </div>
    );
  }

  // ─── Phase 1: Internal Audit ────────────────────────────

  if (step === "internal") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">Phase 1: Your Zone of Genius</h2>
          <p className="text-sm text-ink-muted mt-1">
            Before looking outward, look inward. What are you genuinely qualified
            and excited to discuss for years?
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              The Unscripted Test
            </label>
            <p className="text-xs text-ink-light mb-2">
              What topic could you speak about for 45 minutes on a stage right
              now with zero preparation?
            </p>
            <textarea
              value={unscripted}
              onChange={(e) => setUnscripted(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              The Frustration Point
            </label>
            <p className="text-xs text-ink-light mb-2">
              What is the most common piece of bad advice in your industry that
              drives you crazy?
            </p>
            <textarea
              value={frustration}
              onChange={(e) => setFrustration(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              The Unfair Advantage
            </label>
            <p className="text-xs text-ink-light mb-2">
              What unique experiences, data, or frameworks do you have access to
              that your competitors do not?
            </p>
            <textarea
              value={unfairAdvantage}
              onChange={(e) => setUnfairAdvantage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep("intro")}
            className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink"
          >
            Back
          </button>
          <button
            onClick={() => setStep("external")}
            disabled={!unscripted.trim() || !frustration.trim() || !unfairAdvantage.trim()}
            className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
          >
            Next: Audience Alignment
          </button>
        </div>
      </div>
    );
  }

  // ─── Phase 2: External Audit ────────────────────────────

  if (step === "external") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-ink">Phase 2: Audience & Commercial Alignment</h2>
          <p className="text-sm text-ink-muted mt-1">
            Pillars that don't drive business are a hobby. Align your expertise
            with what the market actually values.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              Audience Pain Mapping
            </label>
            <p className="text-xs text-ink-light mb-2">
              What are the top 3 problems your ideal client is actively trying to
              solve right now?
            </p>
            <textarea
              value={audiencePains}
              onChange={(e) => setAudiencePains(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              The Transformation Bridge
            </label>
            <p className="text-xs text-ink-light mb-2">
              What does your audience need to believe or understand to be ready to
              buy your product or service?
            </p>
            <textarea
              value={transformationBridge}
              onChange={(e) => setTransformationBridge(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
              Real Questions
            </label>
            <p className="text-xs text-ink-light mb-2">
              What are people actually asking you on calls, in comments, or in
              your inbox?
            </p>
            <textarea
              value={realQuestions}
              onChange={(e) => setRealQuestions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep("internal")}
            className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink"
          >
            Back
          </button>
          <button
            onClick={() => {
              setStep("generate");
              handleGenerate();
            }}
            disabled={
              !audiencePains.trim() ||
              !transformationBridge.trim() ||
              !realQuestions.trim()
            }
            className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
          >
            Generate Pillars
          </button>
        </div>
      </div>
    );
  }

  // ─── Phase 3: Generating ────────────────────────────────

  if (step === "generate") {
    return (
      <div className="space-y-6">
        <h2 className="font-serif text-xl text-ink">Synthesizing Your Pillars</h2>
        {generating && (
          <ProcessingBanner
            message="Analyzing your responses..."
            submessage="AI is finding the intersection of your expertise, audience needs, and business objectives to recommend 3-5 content pillars."
          />
        )}
        {error && (
          <div className="space-y-3">
            <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
              {error}
            </div>
            <button
              onClick={() => {
                handleGenerate();
              }}
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Phase 4: Review & Edit ─────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-ink">Your Recommended Pillars</h2>
        <p className="text-sm text-ink-muted mt-1">
          Review and edit these. Each pillar should pass the Rule of 20: can you
          brainstorm 20 distinct post ideas for it? If not, it may be too narrow.
        </p>
      </div>

      <div className="space-y-3">
        {generatedPillars.map((pillar, i) => (
          <div
            key={i}
            className={`rounded-lg border border-paper-muted p-4 space-y-2 ${PILLAR_COLORS[i % PILLAR_COLORS.length].split(" ")[0]}`}
          >
            {editingIndex === i ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-ink-muted block mb-1">Label</label>
                  <input
                    type="text"
                    value={pillar.label}
                    onChange={(e) => {
                      const updated = [...generatedPillars];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setGeneratedPillars(updated);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-muted block mb-1">Short Label</label>
                  <input
                    type="text"
                    value={pillar.shortLabel}
                    onChange={(e) => {
                      const updated = [...generatedPillars];
                      updated[i] = { ...updated[i], shortLabel: e.target.value };
                      setGeneratedPillars(updated);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-muted block mb-1">Description</label>
                  <textarea
                    value={pillar.description}
                    onChange={(e) => {
                      const updated = [...generatedPillars];
                      updated[i] = { ...updated[i], description: e.target.value };
                      setGeneratedPillars(updated);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm resize-y"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-muted block mb-1">Funnel Role</label>
                  <input
                    type="text"
                    value={pillar.funnelRole}
                    onChange={(e) => {
                      const updated = [...generatedPillars];
                      updated[i] = { ...updated[i], funnelRole: e.target.value };
                      setGeneratedPillars(updated);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm"
                  />
                </div>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors"
                >
                  Done editing
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{pillar.label}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{pillar.shortLabel}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingIndex(i)}
                      className="px-2 py-1 rounded text-xs text-ink-light hover:text-ink hover:bg-paper-warm transition-colors"
                    >
                      Edit
                    </button>
                    {generatedPillars.length > 3 && (
                      <button
                        onClick={() => removePillar(i)}
                        className="px-2 py-1 rounded text-xs text-ink-light hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ink-muted">{pillar.description}</p>
                <p className="text-xs text-ink-light">Funnel role: {pillar.funnelRole}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setStep("external")}
          className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving || generatedPillars.length < 3}
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Pillars"}
        </button>
      </div>
    </div>
  );
}
