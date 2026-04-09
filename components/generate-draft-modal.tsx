"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import {
  CONTENT_PILLARS,
  HOOK_TYPES,
  FUNNEL_STAGES,
  FLYWHEEL_TARGET,
} from "@/lib/content-strategy";
import { PERSONA_SIDEBAR_PRINCIPLES } from "@/lib/voice-persona";
import type {
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

interface GenerateDraftModalProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateDraftModal({ open, onClose }: GenerateDraftModalProps) {
  const router = useRouter();
  const [pillar, setPillar] = useState<ContentPillar>(CONTENT_PILLARS[0].value);
  const [hookType, setHookType] = useState<HookType>(HOOK_TYPES[0].value);
  const [funnelStage, setFunnelStage] = useState<FunnelStage>(
    FUNNEL_STAGES[0].value
  );
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVoice, setShowVoice] = useState(false);

  const selectedPillar = CONTENT_PILLARS.find((p) => p.value === pillar)!;
  const selectedHook = HOOK_TYPES.find((h) => h.value === hookType)!;
  const selectedFunnel = FUNNEL_STAGES.find((f) => f.value === funnelStage)!;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillar,
          hookType,
          funnelStage,
          sourceMaterial: sourceMaterial.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        setLoading(false);
        return;
      }

      router.push(`/admin/content/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title="Generate draft">
      <form onSubmit={handleGenerate} className="space-y-5">

        {/* ── Content pillar ── */}
        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            Content Pillar
          </label>
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value as ContentPillar)}
            className="mt-1 w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink"
            disabled={loading}
          >
            {CONTENT_PILLARS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <div className={`mt-2 rounded-md px-3 py-2 text-xs ${selectedPillar.colorClass}`}>
            <p>{selectedPillar.description}</p>
            <p className="mt-1 opacity-70">Funnel role: {selectedPillar.funnelRole}</p>
          </div>
        </div>

        {/* ── Hook type + Funnel stage ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Hook type
            </label>
            <select
              value={hookType}
              onChange={(e) => setHookType(e.target.value as HookType)}
              className="mt-1 w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink"
              disabled={loading}
            >
              {HOOK_TYPES.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-ink-muted px-1">{selectedHook.description}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Funnel stage
            </label>
            <select
              value={funnelStage}
              onChange={(e) => setFunnelStage(e.target.value as FunnelStage)}
              className="mt-1 w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink"
              disabled={loading}
            >
              {FUNNEL_STAGES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className={`mt-2 rounded-md px-2 py-1.5 text-xs ${selectedFunnel.colorClass}`}>
              <p>{selectedFunnel.description}</p>
            </div>
          </div>
        </div>

        {/* ── Flywheel cadence ── */}
        <div className="rounded-md border border-paper-muted bg-paper-warm/30 px-3 py-2">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">
            Weekly flywheel target
          </p>
          <div className="flex gap-4 text-xs text-ink">
            {FUNNEL_STAGES.map((f) => (
              <span
                key={f.value}
                className={funnelStage === f.value ? "font-bold" : "opacity-60"}
              >
                {f.label}: {FLYWHEEL_TARGET[f.value]}/wk
              </span>
            ))}
          </div>
        </div>

        {/* ── Voice rules (collapsible) ── */}
        <div className="rounded-md border border-paper-muted">
          <button
            type="button"
            onClick={() => setShowVoice(!showVoice)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-ink-muted uppercase tracking-wide hover:text-ink transition-colors"
          >
            <span>Voice &amp; style rules</span>
            <span className="text-ink-light">{showVoice ? "Hide" : "Show"}</span>
          </button>
          {showVoice && (
            <div className="px-3 pb-3 space-y-3 border-t border-paper-muted pt-3">
              {PERSONA_SIDEBAR_PRINCIPLES.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-medium text-ink-muted mb-1 capitalize">
                    {group.category === "banned" ? "Banned words & patterns" : group.category}
                  </p>
                  <div className="space-y-0.5">
                    {group.entries.map((entry, i) => (
                      <p
                        key={i}
                        className={`text-xs leading-relaxed ${
                          group.category === "banned"
                            ? "text-terracotta/80"
                            : "text-ink"
                        }`}
                      >
                        {group.category === "banned" ? "✗ " : "• "}
                        {entry}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-ink-light pt-1">
                These rules are injected into the AI system prompt on every generation. Each client defines their own.
              </p>
            </div>
          )}
        </div>

        {/* ── Source material ── */}
        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            Source material (optional)
          </label>
          <textarea
            value={sourceMaterial}
            onChange={(e) => setSourceMaterial(e.target.value)}
            rows={4}
            placeholder="Paste a quote, idea, book reference, or excerpt. Leave empty to generate from scratch."
            className="mt-1 w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink resize-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            Source URL (optional)
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink"
            disabled={loading}
          />
          <p className="text-xs text-ink-light mt-1">
            The AI will fetch and read the page during generation. Nothing is stored.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate draft"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
