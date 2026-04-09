"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentIdea, IdeaStatus, HookType, FunnelStage, IdeaSource, ContentPillar } from "@/lib/types/database";
import { HOOK_TYPES, FUNNEL_STAGES, IDEA_SOURCES, CONTENT_PILLARS } from "@/lib/content-strategy";

const statusTabs: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "captured", label: "Captured" },
  { value: "developing", label: "Developing" },
  { value: "promoted", label: "Promoted" },
  { value: "discarded", label: "Discarded" },
];

const statusColors: Record<IdeaStatus, string> = {
  captured: "bg-clay-muted/20 text-clay",
  developing: "bg-clay/20 text-clay",
  promoted: "bg-moss/20 text-moss",
  discarded: "bg-paper-muted text-ink-light",
};

const sourceColors: Partial<Record<string, string>> = {
  book: "bg-moss/15 text-moss",
  podcast: "bg-clay/15 text-clay",
  youtube: "bg-terracotta/15 text-terracotta",
  article: "bg-ink/10 text-ink",
  external: "bg-paper-muted text-ink-muted",
};

function IdeaSourceDetail({ idea }: { idea: ContentIdea }) {
  const meta = idea.source_metadata;
  const hasMeta = meta && Object.keys(meta).length > 0;
  const hasBasic = idea.source_url || idea.source_material;
  const [expanded, setExpanded] = useState(false);

  if (!hasMeta && !hasBasic) return null;

  const title = meta?.title as string | undefined;
  const authors = meta?.authors as string[] | undefined;
  const takeaways = meta?.key_takeaways as string[] | undefined;
  const entities = meta?.entities as { name: string; type: string }[] | undefined;
  const sourceSystem = meta?.source_system as string | undefined;

  const entityColors: Record<string, string> = {
    PERSON: "bg-clay-muted/20 text-clay",
    BOOK: "bg-moss/15 text-moss",
    CONCEPT: "bg-ink/10 text-ink",
    ORGANIZATION: "bg-terracotta/15 text-terracotta",
    TECHNOLOGY: "bg-clay/15 text-clay",
  };

  return (
    <div className="rounded-md border border-paper-muted bg-paper-warm/20 px-3 py-2 text-xs space-y-1.5">
      {/* Title + authors from metadata */}
      {title && (
        <p className="text-ink font-medium">
          {title}
          {authors && authors.length > 0 && (
            <span className="text-ink-muted font-normal"> by {authors.join(", ")}</span>
          )}
        </p>
      )}

      {/* Source system badge */}
      {sourceSystem && (
        <p className="text-ink-light">
          via <span className="font-mono text-ink-muted">{sourceSystem}</span>
        </p>
      )}

      {/* URL */}
      {idea.source_url && (
        <p className="truncate">
          <span className="text-ink-muted">URL:</span>{" "}
          <a href={idea.source_url} target="_blank" rel="noreferrer" className="text-ink-light hover:underline">
            {idea.source_url}
          </a>
        </p>
      )}

      {/* Entity pills */}
      {entities && entities.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {entities.slice(0, expanded ? undefined : 5).map((e, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded-full ${entityColors[e.type] || "bg-paper-muted text-ink-muted"}`}
            >
              {e.name}
            </span>
          ))}
          {!expanded && entities.length > 5 && (
            <span className="text-ink-light">+{entities.length - 5} more</span>
          )}
        </div>
      )}

      {/* Key takeaways preview */}
      {takeaways && takeaways.length > 0 && (
        <div>
          <p className="text-ink-muted mb-0.5">Key takeaways:</p>
          <ul className="text-ink-light space-y-0.5 pl-3">
            {takeaways.slice(0, expanded ? undefined : 3).map((t, i) => (
              <li key={i} className="list-disc">{t}</li>
            ))}
            {!expanded && takeaways.length > 3 && (
              <li className="list-none text-ink-light">+{takeaways.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Source material (free text) */}
      {idea.source_material && (
        <p className={expanded ? "text-ink-light" : "line-clamp-2 text-ink-light"}>
          <span className="text-ink-muted">Source:</span> {idea.source_material}
        </p>
      )}

      {/* Expand/collapse toggle */}
      {(
        (takeaways && takeaways.length > 3) ||
        (entities && entities.length > 5) ||
        idea.source_material
      ) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [filter, setFilter] = useState<IdeaStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  // Quick capture form
  const [insight, setInsight] = useState("");
  const [source, setSource] = useState<IdeaSource>("personal");
  const [suggestedHook, setSuggestedHook] = useState<HookType | "">("");
  const [suggestedFunnel, setSuggestedFunnel] = useState<FunnelStage | "">("");
  const [suggestedPillar, setSuggestedPillar] = useState<ContentPillar | "">("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  async function load() {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/admin/ideas"
        : `/api/admin/ideas?status=${filter}`;
    const res = await fetch(url);
    if (res.ok) setIdeas(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleCapture() {
    if (!insight.trim()) return;
    setSaving(true);

    const res = await fetch("/api/admin/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_insight: insight,
        source,
        suggested_hook: suggestedHook || null,
        suggested_funnel: suggestedFunnel || null,
        suggested_pillar: suggestedPillar || null,
        source_url: sourceUrl.trim() || null,
        source_material: sourceMaterial.trim() || null,
      }),
    });

    if (res.ok) {
      setInsight("");
      setSuggestedHook("");
      setSuggestedFunnel("");
      setSuggestedPillar("");
      setSourceUrl("");
      setSourceMaterial("");
      load();
    }
    setSaving(false);
  }

  async function generate(id: string) {
    setGeneratingId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/ideas/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok) {
        setRowError({ id, message: data.error || "Generation failed" });
        setGeneratingId(null);
        return;
      }
      router.push(`/admin/content/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setRowError({ id, message });
      setGeneratingId(null);
    }
  }

  async function updateStatus(id: string, status: IdeaStatus) {
    await fetch(`/api/admin/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function promote(id: string) {
    const res = await fetch(`/api/admin/ideas/${id}/promote`, {
      method: "POST",
    });
    if (res.ok) {
      const post = await res.json();
      router.push(`/admin/content/${post.id}`);
    }
  }

  async function discard(id: string) {
    await updateStatus(id, "discarded");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ink">Idea Bank</h1>

      {/* Quick capture */}
      <section className="rounded-lg border border-paper-muted p-4 space-y-3">
        <h2 className="text-xs text-ink-muted uppercase tracking-wide">
          Capture an Insight
        </h2>
        <textarea
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          rows={3}
          placeholder="A raw thought, conversation excerpt, market observation..."
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y"
        />
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as IdeaSource)}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              {IDEA_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Hook (optional)</label>
            <select
              value={suggestedHook}
              onChange={(e) => setSuggestedHook(e.target.value as HookType | "")}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              <option value="">–</option>
              {HOOK_TYPES.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Funnel (optional)</label>
            <select
              value={suggestedFunnel}
              onChange={(e) => setSuggestedFunnel(e.target.value as FunnelStage | "")}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              <option value="">–</option>
              {FUNNEL_STAGES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Pillar (optional)</label>
            <select
              value={suggestedPillar}
              onChange={(e) => setSuggestedPillar(e.target.value as ContentPillar | "")}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay max-w-[160px] truncate"
            >
              <option value="">–</option>
              {CONTENT_PILLARS.map((p) => (
                <option key={p.value} value={p.value}>{p.shortLabel}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCapture}
            disabled={saving || !insight.trim()}
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Capture"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Source URL (optional)</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Source material (optional)</label>
            <input
              type="text"
              value={sourceMaterial}
              onChange={(e) => setSourceMaterial(e.target.value)}
              placeholder="Quote, book ref, podcast summary..."
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay"
            />
          </div>
        </div>
      </section>

      {/* Status filter tabs */}
      <div className="flex gap-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === tab.value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ideas list */}
      {loading ? (
        <p className="text-ink-light text-sm py-8">Loading...</p>
      ) : ideas.length === 0 ? (
        <p className="text-ink-light text-sm py-8">
          No ideas yet. Capture your first insight above.
        </p>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-lg border border-paper-muted p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-ink flex-1">{idea.raw_insight}</p>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${statusColors[idea.status]}`}
                >
                  {idea.status}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  sourceColors[idea.source] || "bg-paper-muted text-ink-muted"
                }`}>
                  {IDEA_SOURCES.find((s) => s.value === idea.source)?.label || idea.source}
                </span>
                {idea.suggested_hook && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-paper-muted text-ink-muted">
                    {idea.suggested_hook}
                  </span>
                )}
                {idea.suggested_funnel && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    FUNNEL_STAGES.find((f) => f.value === idea.suggested_funnel)?.colorClass || ""
                  }`}>
                    {idea.suggested_funnel.toUpperCase()}
                  </span>
                )}
                {idea.suggested_pillar && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    CONTENT_PILLARS.find((p) => p.value === idea.suggested_pillar)?.colorClass || ""
                  }`}>
                    {CONTENT_PILLARS.find((p) => p.value === idea.suggested_pillar)?.shortLabel}
                  </span>
                )}
                <span className="text-xs text-ink-light">
                  {new Date(idea.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Actions */}
              {idea.status !== "promoted" && idea.status !== "discarded" && (
                <div className="flex gap-2 flex-wrap">
                  {idea.status === "captured" && (
                    <button
                      onClick={() => updateStatus(idea.id, "developing")}
                      className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors"
                    >
                      Develop
                    </button>
                  )}
                  <button
                    onClick={() => generate(idea.id)}
                    disabled={generatingId === idea.id}
                    className="px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors disabled:opacity-50"
                  >
                    {generatingId === idea.id ? "Generating..." : "Generate Draft"}
                  </button>
                  <button
                    onClick={() => promote(idea.id)}
                    className="px-3 py-1 rounded-md border border-ink text-ink text-xs hover:bg-ink hover:text-paper transition-colors"
                  >
                    Promote as-is
                  </button>
                  <button
                    onClick={() => discard(idea.id)}
                    className="px-3 py-1 rounded-md text-xs text-ink-light hover:text-terracotta hover:bg-terracotta/10 transition-colors ml-auto"
                  >
                    Discard
                  </button>
                </div>
              )}

              {rowError?.id === idea.id && (
                <div className="rounded-md border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
                  {rowError.message}
                </div>
              )}

              <IdeaSourceDetail idea={idea} />

              {idea.promoted_post_id && (
                <a
                  href={`/admin/content/${idea.promoted_post_id}`}
                  className="text-xs text-clay hover:underline"
                >
                  View draft →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
