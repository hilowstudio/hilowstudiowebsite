"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, RssSimple, YoutubeLogo, Globe, Lightbulb } from "@phosphor-icons/react";
import { ProcessingBanner } from "@/components/processing-banner";
import {
  HOOK_TYPES,
  FUNNEL_STAGES,
  FLYWHEEL_TARGET,
  IDEA_SOURCES,
} from "@/lib/content-strategy";
import type {
  ContentIdea,
  ContentPillar,
  ContentPillarRow,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

type SourceType = "book" | "podcast" | "youtube" | "article";

const sourceCards: { value: SourceType; label: string; icon: typeof BookOpen }[] = [
  { value: "book", label: "My Books", icon: BookOpen },
  { value: "podcast", label: "My Podcasts", icon: RssSimple },
  { value: "youtube", label: "My Videos", icon: YoutubeLogo },
  { value: "article", label: "My Articles", icon: Globe },
];

const PAGE_SIZE = 5;

export default function NewPostPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"source" | "scratch" | null>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [ideasTotal, setIdeasTotal] = useState(0);
  const [ideasPage, setIdeasPage] = useState(0);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [dbPillars, setDbPillars] = useState<ContentPillarRow[]>([]);
  const [pillar, setPillar] = useState<ContentPillar>("");
  const [hookType, setHookType] = useState<HookType>(HOOK_TYPES[0].value);
  const [funnelStage, setFunnelStage] = useState<FunnelStage>(
    FUNNEL_STAGES[0].value
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledHooks, setEnabledHooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/pillars")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ContentPillarRow[]) => {
        setDbPillars(data);
        if (data.length > 0 && !pillar) setPillar(data[0].slug);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings/hooks")
      .then((r) => (r.ok ? r.json() : { enabledHooks: [] }))
      .then((json: { enabledHooks: string[] }) => {
        setEnabledHooks(new Set(json.enabledHooks));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sourceType) return;
    setLoadingIdeas(true);
    fetch(
      `/api/admin/ideas?status=active&source=${sourceType}&limit=${PAGE_SIZE}&offset=${ideasPage * PAGE_SIZE}`,
      { cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : { data: [], total: 0 }))
      .then((json: { data: ContentIdea[]; total: number }) => {
        setIdeas(json.data);
        setIdeasTotal(json.total);
        setLoadingIdeas(false);
      })
      .catch(() => setLoadingIdeas(false));
  }, [sourceType, ideasPage]);

  function selectIdea(idea: ContentIdea) {
    setSelectedIdea(idea);
    if (idea.suggested_pillar) setPillar(idea.suggested_pillar);
    if (idea.suggested_hook) setHookType(idea.suggested_hook);
    if (idea.suggested_funnel) setFunnelStage(idea.suggested_funnel);
  }

  const selectedPillar = dbPillars.find((p) => p.slug === pillar);
  const selectedHook = HOOK_TYPES.find((h) => h.value === hookType)!;
  const selectedFunnel = FUNNEL_STAGES.find((f) => f.value === funnelStage)!;
  const totalPages = Math.ceil(ideasTotal / PAGE_SIZE);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedIdea) {
        setError("Select a source first");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/ideas/${selectedIdea.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillar, hookType, funnelStage }),
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

  async function handleCreateBlankDraft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: null,
          body: "",
          post_type: "text",
          status: "draft",
        }),
      });
      if (res.ok) {
        const post = await res.json();
        router.push(`/admin/content/${post.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create draft");
        setLoading(false);
      }
    } catch {
      setError("Failed to create draft");
      setLoading(false);
    }
  }

  if (mode === null) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/admin/content")}
          className="text-sm text-ink-light hover:text-ink transition-colors"
        >
          &larr; Content
        </button>

        <h1 className="font-serif text-2xl text-ink text-center">New Post</h1>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => setMode("source")}
            className="flex flex-col items-center gap-3 rounded-lg border border-paper-muted p-8 text-center hover:bg-paper-warm hover:border-clay-muted transition-colors"
          >
            <div className="grid grid-cols-2 gap-1">
              <BookOpen size={18} weight="regular" className="text-clay" />
              <RssSimple size={18} weight="regular" className="text-clay" />
              <YoutubeLogo size={18} weight="regular" className="text-clay" />
              <Globe size={18} weight="regular" className="text-clay" />
            </div>
            <span className="text-sm font-medium text-ink">From Source</span>
            <span className="text-xs text-ink-muted">AI generates a draft from a book, podcast, video, or article in your library</span>
          </button>
          <button
            onClick={handleCreateBlankDraft}
            disabled={loading}
            className="flex flex-col items-center gap-3 rounded-lg border border-paper-muted p-8 text-center hover:bg-paper-warm hover:border-clay-muted transition-colors disabled:opacity-50"
          >
            <Lightbulb size={28} weight="regular" className="text-clay" />
            <span className="text-sm font-medium text-ink">From Scratch</span>
            <span className="text-xs text-ink-muted">Write your own post. AI helps you refine your voice and create visual assets.</span>
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setMode(null)}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Back
      </button>

      <h1 className="font-serif text-2xl text-ink text-center">New Post</h1>

      <form onSubmit={handleGenerate} className="space-y-6">

        {/* Source picker: cards → paginated list */}
        {mode === "source" && !sourceType && (
          <div className="space-y-4">
          <p className="text-sm text-ink-muted text-center">
            Select an item from your library to serve as source material for this post.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sourceCards.map((card) => (
              <button
                key={card.value}
                type="button"
                onClick={() => {
                  setSourceType(card.value);
                  setIdeasPage(0);
                  setSelectedIdea(null);
                }}
                className="flex flex-col items-center gap-2 rounded-lg border border-paper-muted p-6 text-center hover:bg-paper-warm hover:border-clay-muted transition-colors"
              >
                <card.icon size={28} weight="regular" className="text-clay" />
                <span className="text-sm font-medium text-ink">{card.label}</span>
              </button>
            ))}
          </div>
          </div>
        )}

        {mode === "source" && sourceType && !selectedIdea && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setSourceType(null);
                setIdeas([]);
                setIdeasTotal(0);
              }}
              className="text-sm text-ink-light hover:text-ink transition-colors"
            >
              &larr; Back to source types
            </button>

            {loadingIdeas ? (
              <p className="text-xs text-ink-light py-4">Loading...</p>
            ) : ideas.length === 0 ? (
              <p className="text-xs text-ink-light py-4">
                No {sourceType} sources found. Add some in the Source Material tab.
              </p>
            ) : (
              <>
                <p className="text-xs text-ink-muted">
                  {ideasTotal} source{ideasTotal !== 1 ? "s" : ""}. Showing{" "}
                  {ideasPage * PAGE_SIZE + 1}-
                  {Math.min((ideasPage + 1) * PAGE_SIZE, ideasTotal)}.
                </p>
                <div className="space-y-1">
                  {ideas.map((idea) => {
                    const meta = idea.source_metadata;
                    const title = (meta?.title as string) || null;
                    const authors = (meta?.authors as string[]) || null;
                    return (
                      <button
                        key={idea.id}
                        type="button"
                        onClick={() => selectIdea(idea)}
                        className="w-full text-left px-3 py-3 rounded-md text-sm transition-colors hover:bg-paper-warm border border-transparent hover:border-clay-muted"
                      >
                        <p className="text-ink font-medium truncate">
                          {title || idea.raw_insight.slice(0, 80)}
                        </p>
                        {authors && authors.length > 0 && (
                          <p className="text-xs text-ink-muted mt-0.5">
                            {authors.join(", ")}
                          </p>
                        )}
                        {!title && (
                          <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                            {idea.raw_insight.slice(0, 120)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIdeasPage((p) => Math.max(0, p - 1))}
                      disabled={ideasPage === 0}
                      className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-ink-muted">
                      Page {ideasPage + 1} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIdeasPage((p) => p + 1)}
                      disabled={ideasPage + 1 >= totalPages}
                      className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Selected source preview */}
        {mode === "source" && selectedIdea && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedIdea(null)}
              className="text-sm text-ink-light hover:text-ink transition-colors"
            >
              &larr; Choose a different source
            </button>
            <div className="rounded-md bg-paper-warm/40 border border-paper-muted px-3 py-3 text-xs text-ink-muted">
              <p className="text-ink text-sm mb-1">
                {(selectedIdea.source_metadata?.title as string) ||
                  selectedIdea.raw_insight.slice(0, 300)}
                {!selectedIdea.source_metadata?.title &&
                  selectedIdea.raw_insight.length > 300
                  ? "..."
                  : ""}
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
          </div>
        )}


        {/* Strategy + Generate (only after source is selected) */}
        {selectedIdea && (<>
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
            {dbPillars.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
          {selectedPillar && (
            <div
              className={`mt-2 rounded-md px-3 py-2 text-xs ${selectedPillar.color_class}`}
            >
              <p>{selectedPillar.description}</p>
              <p className="mt-1 opacity-70">
                Funnel role: {selectedPillar.funnel_role}
              </p>
            </div>
          )}
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
              {HOOK_TYPES.filter(
                (h) =>
                  !h.humanOnly &&
                  (enabledHooks.size === 0 || enabledHooks.has(h.value))
              ).map((h) => (
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
            disabled={loading || !selectedIdea}
            className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Draft"}
          </button>
        </div>
        </>)}
      </form>
    </div>
  );
}
