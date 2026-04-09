"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import {
  CONTENT_PILLARS,
  HOOK_TYPES,
  FUNNEL_STAGES,
} from "@/lib/content-strategy";
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
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            Pillar
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
        </div>

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
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            Source material (optional)
          </label>
          <textarea
            value={sourceMaterial}
            onChange={(e) => setSourceMaterial(e.target.value)}
            rows={5}
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
            Claude will fetch and read the page during generation.
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
