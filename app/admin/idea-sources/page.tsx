"use client";

import { useEffect, useState } from "react";
import type {
  ContentIdea,
  IdeaStatus,
  HookType,
  FunnelStage,
  IdeaSource,
  ContentPillar,
} from "@/lib/types/database";
import {
  HOOK_TYPES,
  FUNNEL_STAGES,
  IDEA_SOURCES,
  CONTENT_PILLARS,
} from "@/lib/content-strategy";
import type { BookMetadata } from "@/lib/sources/google-books";
import type { HardcoverBook } from "@/lib/sources/hardcover";
import type { PodcastSearchResult } from "@/lib/sources/itunes";
import type { FeedEpisode, ParsedFeed } from "@/lib/sources/rss";

const statusTabs: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "captured", label: "Captured" },
  { value: "promoted", label: "Promoted" },
  { value: "discarded", label: "Discarded" },
];

const statusColors: Record<IdeaStatus, string> = {
  captured: "bg-clay-muted/20 text-clay",
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

// ─── Idea detail component ────────────────────────────────

function IdeaSourceDetail({ idea }: { idea: ContentIdea }) {
  const meta = idea.source_metadata;
  const hasMeta = meta && Object.keys(meta).length > 0;
  const hasBasic = idea.source_url || idea.source_material;
  const [expanded, setExpanded] = useState(false);

  if (!hasMeta && !hasBasic) return null;

  const title = meta?.title as string | undefined;
  const authors = meta?.authors as string[] | undefined;
  const takeaways = meta?.key_takeaways as string[] | undefined;
  const entities = meta?.entities as
    | { name: string; type: string }[]
    | undefined;
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
      {title && (
        <p className="text-ink font-medium">
          {title}
          {authors && authors.length > 0 && (
            <span className="text-ink-muted font-normal">
              {" "}
              by {authors.join(", ")}
            </span>
          )}
        </p>
      )}
      {sourceSystem && (
        <p className="text-ink-light">
          via <span className="font-mono text-ink-muted">{sourceSystem}</span>
        </p>
      )}
      {idea.source_url && (
        <p className="truncate">
          <span className="text-ink-muted">URL:</span>{" "}
          <a
            href={idea.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-ink-light hover:underline"
          >
            {idea.source_url}
          </a>
        </p>
      )}
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
            <span className="text-ink-light">
              +{entities.length - 5} more
            </span>
          )}
        </div>
      )}
      {takeaways && takeaways.length > 0 && (
        <div>
          <p className="text-ink-muted mb-0.5">Key takeaways:</p>
          <ul className="text-ink-light space-y-0.5 pl-3">
            {takeaways
              .slice(0, expanded ? undefined : 3)
              .map((t, i) => (
                <li key={i} className="list-disc">
                  {t}
                </li>
              ))}
            {!expanded && takeaways.length > 3 && (
              <li className="list-none text-ink-light">
                +{takeaways.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}
      {((takeaways && takeaways.length > 3) ||
        (entities && entities.length > 5)) && (
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

// ─── Main page ────────────────────────────────────────────

type TopTab = "catalog" | "ingest";

export default function IdeaSourcesPage() {
  const [topTab, setTopTab] = useState<TopTab>("catalog");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Idea Sources</h1>
        <div className="flex gap-1">
          <button
            onClick={() => setTopTab("catalog")}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              topTab === "catalog"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setTopTab("ingest")}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              topTab === "ingest"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            Add Source
          </button>
        </div>
      </div>

      {topTab === "catalog" && <CatalogTab />}
      {topTab === "ingest" && <IngestTab />}
    </div>
  );
}

// ─── Catalog tab (ideas list + quick capture) ─────────────

function CatalogTab() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [filter, setFilter] = useState<IdeaStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  // Quick capture form
  const [insight, setInsight] = useState("");
  const [source, setSource] = useState<IdeaSource>("personal");
  const [suggestedHook, setSuggestedHook] = useState<HookType | "">("");
  const [suggestedFunnel, setSuggestedFunnel] = useState<FunnelStage | "">("");
  const [suggestedPillar, setSuggestedPillar] = useState<ContentPillar | "">(
    ""
  );
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function updateStatus(id: string, status: IdeaStatus) {
    await fetch(`/api/admin/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="space-y-6">
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
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">
              Hook (optional)
            </label>
            <select
              value={suggestedHook}
              onChange={(e) =>
                setSuggestedHook(e.target.value as HookType | "")
              }
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              <option value="">-</option>
              {HOOK_TYPES.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">
              Funnel (optional)
            </label>
            <select
              value={suggestedFunnel}
              onChange={(e) =>
                setSuggestedFunnel(e.target.value as FunnelStage | "")
              }
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              <option value="">-</option>
              {FUNNEL_STAGES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">
              Pillar (optional)
            </label>
            <select
              value={suggestedPillar}
              onChange={(e) =>
                setSuggestedPillar(e.target.value as ContentPillar | "")
              }
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay max-w-[160px] truncate"
            >
              <option value="">-</option>
              {CONTENT_PILLARS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.shortLabel}
                </option>
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
            <label className="text-xs text-ink-muted block mb-1">
              Source URL (optional)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">
              Source material (optional)
            </label>
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

      {/* Status filter */}
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
          No idea sources yet. Capture an insight above or add a source.
        </p>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-lg border border-paper-muted p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-ink flex-1">
                  {idea.raw_insight}
                </p>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${statusColors[idea.status]}`}
                >
                  {idea.status}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    sourceColors[idea.source] ||
                    "bg-paper-muted text-ink-muted"
                  }`}
                >
                  {IDEA_SOURCES.find((s) => s.value === idea.source)
                    ?.label || idea.source}
                </span>
                {idea.suggested_hook && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-paper-muted text-ink-muted">
                    {idea.suggested_hook}
                  </span>
                )}
                {idea.suggested_funnel && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      FUNNEL_STAGES.find(
                        (f) => f.value === idea.suggested_funnel
                      )?.colorClass || ""
                    }`}
                  >
                    {idea.suggested_funnel.toUpperCase()}
                  </span>
                )}
                {idea.suggested_pillar && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      CONTENT_PILLARS.find(
                        (p) => p.value === idea.suggested_pillar
                      )?.colorClass || ""
                    }`}
                  >
                    {CONTENT_PILLARS.find(
                      (p) => p.value === idea.suggested_pillar
                    )?.shortLabel}
                  </span>
                )}
                <span className="text-xs text-ink-light">
                  {new Date(idea.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Actions: catalog management only, no generation */}
              {idea.status === "captured" && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateStatus(idea.id, "discarded")}
                    className="px-3 py-1 rounded-md text-xs text-ink-light hover:text-terracotta hover:bg-terracotta/10 transition-colors ml-auto"
                  >
                    Discard
                  </button>
                </div>
              )}

              <IdeaSourceDetail idea={idea} />

              {idea.promoted_post_id && (
                <a
                  href={`/admin/content/${idea.promoted_post_id}`}
                  className="text-xs text-clay hover:underline"
                >
                  View draft &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ingest tab (articles, books, podcasts/youtube) ───────

type IngestMode = "articles" | "books" | "podcasts";

const ingestTabs: { value: IngestMode; label: string }[] = [
  { value: "articles", label: "Articles" },
  { value: "books", label: "Books" },
  { value: "podcasts", label: "Podcasts & YouTube" },
];

function IngestTab() {
  const [mode, setMode] = useState<IngestMode>("articles");

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {ingestTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setMode(tab.value)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              mode === tab.value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "articles" && <ArticleIngest />}
      {mode === "books" && <BookIngest />}
      {mode === "podcasts" && <PodcastIngest />}
    </div>
  );
}

// ─── Article ingestion ────────────────────────────────────

function ArticleIngest() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleIngest() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/admin/sources/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (res.ok) {
      setResult("Queued for processing. Check the Catalog tab shortly.");
      setUrl("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to queue");
    }
    setLoading(false);
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-ink-muted">
        Paste a URL. The AI will fetch the page, summarize it, and add it to
        your idea source catalog.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleIngest()}
        />
        <button
          onClick={handleIngest}
          disabled={loading || !url.trim()}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {loading ? "Queuing..." : "Ingest"}
        </button>
      </div>
      {result && <p className="text-sm text-moss">{result}</p>}
      {error && <p className="text-sm text-terracotta">{error}</p>}
    </section>
  );
}

// ─── Book ingestion ───────────────────────────────────────

function BookIngest() {
  const [bookMode, setBookMode] = useState<"hardcover" | "search">("hardcover");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [hardcoverBooks, setHardcoverBooks] = useState<HardcoverBook[]>([]);
  const [hardcoverTotal, setHardcoverTotal] = useState(0);
  const [hardcoverPage, setHardcoverPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [loadingHardcover, setLoadingHardcover] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  async function loadHardcover(page: number) {
    setLoadingHardcover(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/sources/hardcover?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
    );
    if (res.ok) {
      const data = await res.json();
      setHardcoverBooks(data.books);
      setHardcoverTotal(data.total);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to load Hardcover library");
    }
    setLoadingHardcover(false);
  }

  useEffect(() => {
    if (bookMode === "hardcover") {
      loadHardcover(hardcoverPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookMode, hardcoverPage]);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setMessage(null);

    const res = await fetch(
      `/api/admin/sources/book/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      setResults(await res.json());
    }
    setSearching(false);
  }

  async function handleIngestBook(book: {
    title: string;
    authors: string[];
    description?: string | null;
    coverUrl?: string | null;
  }) {
    const key = book.title;
    setIngesting(key);
    setMessage(null);

    const res = await fetch("/api/admin/sources/book/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });

    if (res.ok) {
      setMessage(`"${book.title}" queued for AI summarization.`);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to queue");
    }
    setIngesting(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setBookMode("hardcover")}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${
            bookMode === "hardcover"
              ? "bg-clay text-paper"
              : "text-ink-muted border border-paper-muted hover:text-ink"
          }`}
        >
          My Hardcover Library
        </button>
        <button
          onClick={() => setBookMode("search")}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${
            bookMode === "search"
              ? "bg-clay text-paper"
              : "text-ink-muted border border-paper-muted hover:text-ink"
          }`}
        >
          Search Google Books
        </button>
      </div>

      {message && <p className="text-sm text-moss">{message}</p>}

      {/* Hardcover library */}
      {bookMode === "hardcover" && (
        <>
          <p className="text-sm text-ink-muted">
            Books you've marked as "Read" on Hardcover. Select one to generate
            an AI summary and add it to your catalog.
          </p>
          {loadingHardcover ? (
            <p className="text-ink-light text-sm py-4">
              Loading your Hardcover library...
            </p>
          ) : hardcoverBooks.length === 0 ? (
            <p className="text-ink-light text-sm py-4">
              No read books found. Mark books as "Read" on Hardcover to see
              them here.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">
                {hardcoverTotal} books read. Showing {hardcoverPage * PAGE_SIZE + 1}
                -{Math.min((hardcoverPage + 1) * PAGE_SIZE, hardcoverTotal)}.
              </p>
              <div className="space-y-2">
              {hardcoverBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-start gap-3 rounded-lg border border-paper-muted p-3"
                >
                  {book.coverUrl && (
                    <img
                      src={book.coverUrl}
                      alt=""
                      className="w-12 h-16 object-cover rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {book.title}
                    </p>
                    {book.authors.length > 0 && (
                      <p className="text-xs text-ink-muted">
                        {book.authors.join(", ")}
                      </p>
                    )}
                    {book.description && (
                      <p className="text-xs text-ink-light mt-1 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1 text-xs text-ink-light">
                      {book.rating && <span>Rating: {book.rating}/5</span>}
                      {book.lastReadDate && (
                        <span>
                          Read{" "}
                          {new Date(book.lastReadDate).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleIngestBook({
                        title: book.title,
                        authors: book.authors,
                        description: book.description,
                        coverUrl: book.coverUrl,
                      })
                    }
                    disabled={ingesting === book.title}
                    className="shrink-0 px-3 py-1 rounded-md bg-ink text-paper text-xs hover:bg-ink-muted transition-colors disabled:opacity-50"
                  >
                    {ingesting === book.title ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setHardcoverPage((p) => Math.max(0, p - 1))}
                  disabled={hardcoverPage === 0 || loadingHardcover}
                  className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-xs text-ink-muted">
                  Page {hardcoverPage + 1} of{" "}
                  {Math.ceil(hardcoverTotal / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setHardcoverPage((p) => p + 1)}
                  disabled={
                    (hardcoverPage + 1) * PAGE_SIZE >= hardcoverTotal ||
                    loadingHardcover
                  }
                  className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Google Books search */}
      {bookMode === "search" && (
        <>
          <p className="text-sm text-ink-muted">
            Search Google Books. Select a title to generate an AI summary and
            add it to your catalog.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={searching}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((book) => {
                const key = book.isbn || book.title;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded-lg border border-paper-muted p-3"
                  >
                    {book.coverUrl && (
                      <img
                        src={book.coverUrl}
                        alt=""
                        className="w-12 h-16 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {book.title}
                      </p>
                      {book.authors.length > 0 && (
                        <p className="text-xs text-ink-muted">
                          {book.authors.join(", ")}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-xs text-ink-light mt-1 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-1 text-xs text-ink-light">
                        {book.pageCount && <span>{book.pageCount} pages</span>}
                        {book.publishedDate && (
                          <span>{book.publishedDate}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleIngestBook(book)}
                      disabled={ingesting === key}
                      className="shrink-0 px-3 py-1 rounded-md bg-ink text-paper text-xs hover:bg-ink-muted transition-colors disabled:opacity-50"
                    >
                      {ingesting === key ? "Adding..." : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Podcast & YouTube ingestion ──────────────────────────

function PodcastIngest() {
  const [mode, setMode] = useState<"search" | "rss" | "youtube">("search");
  const [query, setQuery] = useState("");
  const [podcastResults, setPodcastResults] = useState<PodcastSearchResult[]>(
    []
  );
  const [feed, setFeed] = useState<ParsedFeed | null>(null);
  const [feedUrl, setFeedUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePodcastSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setPodcastResults([]);
    setFeed(null);
    setMessage(null);

    const res = await fetch(
      `/api/admin/sources/podcast/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      setPodcastResults(await res.json());
    }
    setSearching(false);
  }

  async function handleLoadFeed(url: string) {
    setLoadingFeed(true);
    setFeed(null);
    setMessage(null);

    const res = await fetch(
      `/api/admin/sources/podcast/feed?url=${encodeURIComponent(url)}`
    );
    if (res.ok) {
      setFeed(await res.json());
      setFeedUrl(url);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to load feed");
    }
    setLoadingFeed(false);
  }

  async function handleIngestEpisode(ep: FeedEpisode) {
    setIngesting(ep.guid);
    setMessage(null);

    const res = await fetch("/api/admin/sources/podcast/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: ep.title,
        audioUrl: ep.audioUrl,
        description: ep.description,
        publishedAt: ep.publishedAt,
        feedTitle: feed?.title,
        transcriptUrl: ep.transcriptUrl,
      }),
    });

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(
        data.queued
          ? `"${ep.title}" queued for transcription + AI analysis.`
          : `"${ep.title}" already ingested.`
      );
    } else {
      setMessage(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  async function handleYouTubeIngest() {
    if (!youtubeUrl.trim()) return;
    setIngesting("youtube");
    setMessage(null);

    const res = await fetch("/api/admin/sources/podcast/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: youtubeUrl,
        youtubeUrl,
      }),
    });

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(
        data.queued
          ? "YouTube video queued for transcript + AI analysis."
          : "Already ingested."
      );
      setYoutubeUrl("");
    } else {
      setMessage(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            { value: "search", label: "Search Podcasts" },
            { value: "rss", label: "RSS Feed" },
            { value: "youtube", label: "YouTube" },
          ] as const
        ).map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setMode(m.value);
              setMessage(null);
            }}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              mode === m.value
                ? "bg-clay text-paper"
                : "text-ink-muted border border-paper-muted hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-moss">{message}</p>}

      {mode === "search" && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search podcasts on iTunes..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={searching}
              onKeyDown={(e) =>
                e.key === "Enter" && handlePodcastSearch()
              }
            />
            <button
              onClick={handlePodcastSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {podcastResults.length > 0 && !feed && (
            <div className="space-y-2">
              {podcastResults.map((pod) => (
                <div
                  key={pod.feedUrl}
                  className="flex items-center gap-3 rounded-lg border border-paper-muted p-3"
                >
                  {pod.image && (
                    <img
                      src={pod.image}
                      alt=""
                      className="w-10 h-10 rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {pod.title}
                    </p>
                    <p className="text-xs text-ink-muted">{pod.author}</p>
                  </div>
                  <button
                    onClick={() => handleLoadFeed(pod.feedUrl)}
                    disabled={loadingFeed}
                    className="shrink-0 px-3 py-1 rounded-md border border-ink text-ink text-xs hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                  >
                    {loadingFeed ? "Loading..." : "View Episodes"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "rss" && !feed && (
        <div className="flex gap-2">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="Paste RSS feed URL..."
            className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            disabled={loadingFeed}
            onKeyDown={(e) =>
              e.key === "Enter" && handleLoadFeed(feedUrl)
            }
          />
          <button
            onClick={() => handleLoadFeed(feedUrl)}
            disabled={loadingFeed || !feedUrl.trim()}
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {loadingFeed ? "Loading..." : "Load Feed"}
          </button>
        </div>
      )}

      {mode === "youtube" && (
        <div>
          <p className="text-sm text-ink-muted mb-2">
            Paste a YouTube video URL. The transcript will be extracted and
            analyzed.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={ingesting === "youtube"}
              onKeyDown={(e) =>
                e.key === "Enter" && handleYouTubeIngest()
              }
            />
            <button
              onClick={handleYouTubeIngest}
              disabled={ingesting === "youtube" || !youtubeUrl.trim()}
              className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {ingesting === "youtube" ? "Queuing..." : "Ingest"}
            </button>
          </div>
        </div>
      )}

      {feed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{feed.title}</p>
              <p className="text-xs text-ink-muted">
                {feed.episodes.length} episodes
              </p>
            </div>
            <button
              onClick={() => {
                setFeed(null);
                setPodcastResults([]);
              }}
              className="text-xs text-ink-muted hover:text-ink"
            >
              Back
            </button>
          </div>
          <div className="space-y-1">
            {feed.episodes.map((ep) => (
              <div
                key={ep.guid}
                className="flex items-center justify-between gap-3 rounded-md border border-paper-muted px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{ep.title}</p>
                  {ep.publishedAt && (
                    <p className="text-xs text-ink-light">
                      {new Date(ep.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleIngestEpisode(ep)}
                  disabled={ingesting === ep.guid || !ep.audioUrl}
                  className="shrink-0 px-3 py-1 rounded-md bg-ink text-paper text-xs hover:bg-ink-muted transition-colors disabled:opacity-50"
                >
                  {ingesting === ep.guid
                    ? "Queuing..."
                    : !ep.audioUrl
                      ? "No audio"
                      : "Ingest"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
