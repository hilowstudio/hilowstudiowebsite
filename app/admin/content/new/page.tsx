"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProcessingBanner } from "@/components/processing-banner";
import {
  CONTENT_PILLARS,
  HOOK_TYPES,
  FUNNEL_STAGES,
  FLYWHEEL_TARGET,
  IDEA_SOURCES,
} from "@/lib/content-strategy";
import type {
  ContentIdea,
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

export default function NewPostPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"source" | "scratch">("source");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [pillar, setPillar] = useState<ContentPillar>(CONTENT_PILLARS[0].value);
  const [hookType, setHookType] = useState<HookType>(HOOK_TYPES[0].value);
  const [funnelStage, setFunnelStage] = useState<FunnelStage>(
    FUNNEL_STAGES[0].value
  );
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideaSearch, setIdeaSearch] = useState("");

  useEffect(() => {
    setLoadingIdeas(true);
    fetch("/api/admin/ideas?status=active&limit=100&offset=0")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json: { data: ContentIdea[] }) => {
        setIdeas(json.data);
        setLoadingIdeas(false);
      })
      .catch(() => setLoadingIdeas(false));
  }, []);

  function selectIdea(idea: ContentIdea) {
    setSelectedIdea(idea);
    if (idea.suggested_pillar) setPillar(idea.suggested_pillar);
    if (idea.suggested_hook) setHookType(idea.suggested_hook);
    if (idea.suggested_funnel) setFunnelStage(idea.suggested_funnel);
  }

  const selectedPillar = CONTENT_PILLARS.find((p) => p.value === pillar)!;
  const selectedHook = HOOK_TYPES.find((h) => h.value === hookType)!;
  const selectedFunnel = FUNNEL_STAGES.find((f) => f.value === funnelStage)!;

  const filteredIdeas = ideaSearch.trim()
    ? ideas.filter(
        (i) =>
          i.raw_insight.toLowerCase().includes(ideaSearch.toLowerCase()) ||
          ((i.source_metadata?.title as string) || "")
            .toLowerCase()
            .includes(ideaSearch.toLowerCase())
      )
    : ideas;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res: Response;

      if (mode === "source" && selectedIdea) {
        res = await fetch(`/api/admin/ideas/${selectedIdea.id}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pillar, hookType, funnelStage }),
        });
      } else {
        res = await fetch("/api/admin/generate", {
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
      }

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
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/admin/content")}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Content
      </button>

      <h1 className="font-serif text-2xl text-ink">New Post</h1>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("source");
              setSelectedIdea(null);
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              mode === "source"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            From source material
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("scratch");
              setSelectedIdea(null);
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              mode === "scratch"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            From scratch
          </button>
        </div>

        {/* Source picker */}
        {mode === "source" && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Select a source
            </label>
            <input
              type="text"
              value={ideaSearch}
              onChange={(e) => setIdeaSearch(e.target.value)}
              placeholder="Search sources..."
              className="w-full rounded-md border border-paper-muted bg-paper px-3 py-2 text-sm text-ink"
              disabled={loading}
            />
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-md border border-paper-muted p-1">
              {loadingIdeas ? (
                <p className="text-xs text-ink-light p-3">Loading sources...</p>
              ) : filteredIdeas.length === 0 ? (
                <p className="text-xs text-ink-light p-3">
                  No sources found. Add some in the Source Material tab.
                </p>
              ) : (
                filteredIdeas.map((idea) => {
                  const meta = idea.source_metadata;
                  const title = (meta?.title as string) || null;
                  return (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => selectIdea(idea)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedIdea?.id === idea.id
                          ? "bg-ink/10 border border-ink/20"
                          : "hover:bg-paper-warm"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                            ({
                              book: "bg-moss/15 text-moss",
                              podcast: "bg-clay/15 text-clay",
                              youtube: "bg-terracotta/15 text-terracotta",
                              article: "bg-ink/10 text-ink",
                            } as Record<string, string>)[idea.source] ||
                            "bg-paper-muted text-ink-muted"
                          }`}
                        >
                          {IDEA_SOURCES.find((s) => s.value === idea.source)
                            ?.label || idea.source}
                        </span>
                        <span className="text-ink truncate text-xs">
                          {title || idea.raw_insight.slice(0, 80)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {selectedIdea && (
              <div className="rounded-md bg-paper-warm/40 border border-paper-muted px-3 py-3 text-xs text-ink-muted">
                <p className="text-ink text-sm mb-1">
                  {selectedIdea.raw_insight.slice(0, 300)}
                  {selectedIdea.raw_insight.length > 300 ? "..." : ""}
                </p>
                {Array.isArray(selectedIdea.source_metadata?.key_takeaways) && (
                  <ul className="mt-1.5 space-y-0.5 pl-3">
                    {(selectedIdea.source_metadata.key_takeaways as string[])
                      .slice(0, 3)
                      .map((t, i) => (
                        <li key={i} className="list-disc">
                          {String(t)}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scratch mode */}
        {mode === "scratch" && (
          <div className="space-y-4">
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
                The AI will fetch and read the page during generation.
              </p>
            </div>
          </div>
        )}

        {/* Content pillar */}
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
          <div
            className={`mt-2 rounded-md px-3 py-2 text-xs ${selectedPillar.colorClass}`}
          >
            <p>{selectedPillar.description}</p>
            <p className="mt-1 opacity-70">
              Funnel role: {selectedPillar.funnelRole}
            </p>
          </div>
        </div>

        {/* Hook type + Funnel stage */}
        <div className="grid grid-cols-2 gap-4">
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
            <p className="mt-2 text-xs text-ink-muted px-1">
              {selectedHook.description}
            </p>
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
            <div
              className={`mt-2 rounded-md px-2 py-1.5 text-xs ${selectedFunnel.colorClass}`}
            >
              <p>{selectedFunnel.description}</p>
            </div>
          </div>
        </div>

        {/* Flywheel cadence */}
        <div className="rounded-md border border-paper-muted bg-paper-warm/30 px-3 py-2">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">
            Weekly flywheel target
          </p>
          <div className="flex gap-4 text-xs text-ink">
            {FUNNEL_STAGES.map((f) => (
              <span
                key={f.value}
                className={
                  funnelStage === f.value ? "font-bold" : "opacity-60"
                }
              >
                {f.label}: {FLYWHEEL_TARGET[f.value]}/wk
              </span>
            ))}
          </div>
        </div>

        {/* Processing / Error */}
        {loading && (
          <ProcessingBanner
            message="Generating your draft..."
            submessage="Claude is applying your voice rules, pillar framing, and source material to write a LinkedIn post."
          />
        )}

        {error && (
          <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/content")}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm text-ink-muted hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (mode === "source" && !selectedIdea)}
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
