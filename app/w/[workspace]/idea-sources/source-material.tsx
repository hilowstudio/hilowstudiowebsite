"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, RssSimple, YoutubeLogo, Globe } from "@phosphor-icons/react";
import { ProcessingBanner } from "@/components/processing-banner";
import type { ContentIdea } from "@/lib/types/database";
import { IDEA_SOURCES } from "@/lib/content-strategy";
import type { BookMetadata } from "@/lib/sources/google-books";
import type { HardcoverBook } from "@/lib/sources/hardcover";
import type { PodcastSearchResult } from "@/lib/sources/itunes";

const sourceColors: Record<string, string> = {
  book: "bg-moss/15 text-moss",
  podcast: "bg-clay/15 text-clay",
  youtube: "bg-terracotta/15 text-terracotta",
  article: "bg-ink/10 text-ink",
  repurpose: "bg-clay-muted/20 text-clay",
  personal: "bg-paper-muted text-ink-muted",
  external: "bg-paper-muted text-ink-muted",
};

const PAGE_SIZE = 5;

type TopView = "add" | "my";

export function WorkspaceSourceMaterial({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [view, setView] = useState<TopView>("add");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Source Material</h1>
        <p className="text-sm text-ink-muted mt-1">
          Gather source material for content inspiration.
        </p>
      </div>

      <div className="flex justify-center border-b border-paper-muted -mb-px">
        <button
          onClick={() => setView("add")}
          className={`px-5 py-2.5 text-sm transition-colors border-b-2 ${
            view === "add"
              ? "border-clay text-clay font-medium"
              : "border-transparent text-ink-muted hover:text-ink hover:border-clay-muted"
          }`}
        >
          Add Sources
        </button>
        <button
          onClick={() => setView("my")}
          className={`px-5 py-2.5 text-sm transition-colors border-b-2 ${
            view === "my"
              ? "border-clay text-clay font-medium"
              : "border-transparent text-ink-muted hover:text-ink hover:border-clay-muted"
          }`}
        >
          My Sources
        </button>
      </div>

      <div className="pt-4">
        {view === "add" && <AddSources workspaceId={workspaceId} />}
        {view === "my" && <MySources workspaceId={workspaceId} />}
      </div>
    </div>
  );
}

type AddMode = "books" | "podcasts" | "youtube" | "articles" | null;

const addCards = [
  {
    value: "books" as const,
    label: "Add Book",
    icon: BookOpen,
    description: "Search Google Books or your Hardcover library",
  },
  {
    value: "podcasts" as const,
    label: "Add Podcast",
    icon: RssSimple,
    description: "Search iTunes for podcast episodes",
  },
  {
    value: "youtube" as const,
    label: "Add Video",
    icon: YoutubeLogo,
    description: "Search YouTube or paste a video URL",
  },
  {
    value: "articles" as const,
    label: "Add Article",
    icon: Globe,
    description: "Paste a URL to summarize any web page",
  },
];

function AddSources({ workspaceId }: { workspaceId: string }) {
  const [mode, setMode] = useState<AddMode>(null);

  if (mode === null) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {addCards.map((card) => (
          <button
            key={card.value}
            onClick={() => setMode(card.value)}
            className="flex flex-col items-center gap-2 rounded-lg border border-paper-muted p-6 text-center hover:bg-paper-warm hover:border-clay-muted transition-colors"
          >
            <card.icon size={28} weight="regular" className="text-clay" />
            <span className="text-sm font-medium text-ink">{card.label}</span>
            <span className="text-xs text-ink-muted">{card.description}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setMode(null)}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Back
      </button>
      {mode === "books" && <BookAdd workspaceId={workspaceId} />}
      {mode === "podcasts" && <PodcastAdd workspaceId={workspaceId} />}
      {mode === "youtube" && <YouTubeAdd workspaceId={workspaceId} />}
      {mode === "articles" && <ArticleAdd workspaceId={workspaceId} />}
    </div>
  );
}

type SourceTab = "book" | "podcast" | "youtube" | "article" | "repurpose" | "hidden";

const myCards = [
  { value: "book" as const, label: "My Books", icon: BookOpen },
  { value: "podcast" as const, label: "My Podcasts", icon: RssSimple },
  { value: "youtube" as const, label: "My Videos", icon: YoutubeLogo },
  { value: "article" as const, label: "My Articles", icon: Globe },
];

function MySources({ workspaceId }: { workspaceId: string }) {
  const [tab, setTab] = useState<SourceTab | null>(null);
  const [sources, setSources] = useState<ContentIdea[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tab) return;
    setLoading(true);
    const isHidden = tab === "hidden";
    const status = isHidden ? "hidden" : "active";
    const sourceParam = isHidden ? "" : `&source=${tab}`;
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/ideas?status=${status}${sourceParam}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const json = await res.json();
      setSources(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [tab, page, workspaceId]);

  const loadHiddenCount = useCallback(async () => {
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/ideas?status=hidden&count=true`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const json = await res.json();
      setHiddenCount(json.count || 0);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadHiddenCount();
  }, [loadHiddenCount]);

  async function hideSource(id: string) {
    setActionLoading(id);
    await fetch(`/api/ops/workspaces/${workspaceId}/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "hidden" }),
    });
    await load();
    await loadHiddenCount();
    setActionLoading(null);
  }

  async function unhideSource(id: string) {
    setActionLoading(id);
    await fetch(`/api/ops/workspaces/${workspaceId}/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    await load();
    await loadHiddenCount();
    setActionLoading(null);
  }

  async function deleteSource(id: string) {
    if (!confirm("Permanently delete this source? This cannot be undone."))
      return;
    setActionLoading(id);
    await fetch(`/api/ops/workspaces/${workspaceId}/ideas/${id}`, {
      method: "DELETE",
    });
    await load();
    await loadHiddenCount();
    setActionLoading(null);
  }

  if (tab === null) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {myCards.map((card) => (
            <button
              key={card.value}
              onClick={() => {
                setTab(card.value);
                setPage(0);
              }}
              className="flex flex-col items-center gap-2 rounded-lg border border-paper-muted p-6 text-center hover:bg-paper-warm hover:border-clay-muted transition-colors"
            >
              <card.icon size={28} weight="regular" className="text-clay" />
              <span className="text-sm font-medium text-ink">{card.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              setTab("repurpose");
              setPage(0);
            }}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Repurpose
          </button>
          {hiddenCount > 0 && (
            <button
              onClick={() => {
                setTab("hidden");
                setPage(0);
              }}
              className="text-xs text-ink-light hover:text-ink transition-colors"
            >
              Hidden ({hiddenCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setTab(null)}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Back
      </button>

      {tab === "hidden" && (
        <p className="text-xs text-ink-muted bg-paper-warm/50 rounded-md px-3 py-2">
          Hidden sources are excluded from the Content Generator but remain in
          your account.
        </p>
      )}

      {loading ? (
        <p className="text-ink-light text-sm py-6">Loading...</p>
      ) : sources.length === 0 ? (
        <p className="text-ink-light text-sm py-6">
          {tab === "hidden" ? "No hidden sources." : "No sources yet. Add some above."}
        </p>
      ) : (
        <>
          <p className="text-xs text-ink-muted">
            {total} source{total !== 1 ? "s" : ""}. Showing{" "}
            {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, total)}.
          </p>

          <div className="space-y-2">
            {sources.map((src) => {
              const meta = src.source_metadata;
              const title = (meta?.title as string) || null;
              const authors = (meta?.authors as string[]) || null;
              const coverUrl = (meta?.cover_url as string) || null;
              const takeaways = (meta?.key_takeaways as string[]) || null;
              const summary = (meta?.summary as string) || null;

              return (
                <div
                  key={src.id}
                  className="rounded-lg border border-paper-muted p-4 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    {coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverUrl}
                        alt=""
                        className="w-10 h-14 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {title && (
                            <p className="text-sm font-medium text-ink">
                              {title}
                              {authors && authors.length > 0 && (
                                <span className="text-ink-muted font-normal">
                                  {" "}by {authors.join(", ")}
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-sm text-ink-muted line-clamp-2 mt-0.5">
                            {summary || src.raw_insight}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {src.use_count > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-moss/15 text-moss">
                              Used {src.use_count}x
                            </span>
                          )}
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              sourceColors[src.source] || "bg-paper-muted text-ink-muted"
                            }`}
                          >
                            {IDEA_SOURCES.find((s) => s.value === src.source)?.label ||
                              src.source}
                          </span>
                        </div>
                      </div>

                      {takeaways && takeaways.length > 0 && (
                        <ul className="mt-1.5 text-xs text-ink-light space-y-0.5 pl-3">
                          {takeaways.slice(0, 2).map((t, i) => (
                            <li key={i} className="list-disc">
                              {String(t)}
                            </li>
                          ))}
                          {takeaways.length > 2 && (
                            <li className="list-none text-ink-light">
                              +{takeaways.length - 2} more
                            </li>
                          )}
                        </ul>
                      )}

                      {src.source_url && (
                        <p className="text-xs text-ink-light mt-1 truncate">
                          <a
                            href={src.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {src.source_url}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-paper-muted/50">
                    <span className="text-xs text-ink-light mr-auto">
                      {new Date(src.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {tab === "hidden" ? (
                      <>
                        <button
                          onClick={() => unhideSource(src.id)}
                          disabled={actionLoading === src.id}
                          className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors disabled:opacity-50"
                        >
                          Unhide
                        </button>
                        <button
                          onClick={() => deleteSource(src.id)}
                          disabled={actionLoading === src.id}
                          className="px-3 py-1 rounded-md text-xs text-terracotta hover:bg-terracotta/10 transition-colors disabled:opacity-50"
                        >
                          Delete permanently
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => hideSource(src.id)}
                        disabled={actionLoading === src.id}
                        className="px-3 py-1 rounded-md text-xs text-ink-light hover:text-ink hover:bg-paper-warm transition-colors disabled:opacity-50"
                      >
                        Hide source
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs text-ink-muted">
                Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * PAGE_SIZE >= total || loading}
                className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArticleAdd({ workspaceId }: { workspaceId: string }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleIngest() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch(`/api/ops/workspaces/${workspaceId}/sources/article`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (res.ok) {
      setResult("Queued");
      setUrl("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to queue");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        Paste a URL. The AI will read, summarize, and add it to your sources.
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
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Queuing..." : "Add"}
        </button>
      </div>
      {result && (
        <ProcessingBanner
          message="Article queued for processing"
          submessage="AI is reading and summarizing. It will appear in My Sources shortly."
        />
      )}
      {error && <p className="text-sm text-terracotta">{error}</p>}
    </div>
  );
}

function BookAdd({ workspaceId }: { workspaceId: string }) {
  const [bookMode, setBookMode] = useState<"search" | "hardcover">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [resultPage, setResultPage] = useState(0);
  const [hardcoverBooks, setHardcoverBooks] = useState<HardcoverBook[]>([]);
  const [hardcoverTotal, setHardcoverTotal] = useState(0);
  const [hardcoverPage, setHardcoverPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [loadingHardcover, setLoadingHardcover] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadHardcover(pg: number) {
    setLoadingHardcover(true);
    setMessage(null);
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/hardcover?limit=${PAGE_SIZE}&offset=${pg * PAGE_SIZE}`,
      { cache: "no-store" },
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
    setResultPage(0);
    setMessage(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/book/search?q=${encodeURIComponent(query)}`,
    );
    if (res.ok) setResults(await res.json());
    setSearching(false);
  }

  async function handleIngestBook(book: {
    title: string;
    authors: string[];
    description?: string | null;
    coverUrl?: string | null;
  }) {
    setIngesting(book.title);
    setMessage(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/book/ingest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      },
    );

    if (res.ok) {
      setMessage(`"${book.title}" queued for AI summarization.`);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to queue");
    }
    setIngesting(null);
  }

  function BookCover({ url }: { url: string | null }) {
    if (url) {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={url}
          alt=""
          className="w-12 h-16 object-cover rounded shrink-0"
        />
      );
    }
    return (
      <div className="w-12 h-16 rounded shrink-0 bg-paper-muted flex items-center justify-center">
        <span className="text-ink-light text-xs leading-tight text-center px-0.5">
          No cover
        </span>
      </div>
    );
  }

  const pagedResults = results.slice(
    resultPage * PAGE_SIZE,
    (resultPage + 1) * PAGE_SIZE,
  );
  const totalResultPages = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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
      </div>

      {message && (
        <ProcessingBanner
          message={message}
          submessage="AI is generating a deep summary. It will appear in My Sources when complete."
        />
      )}

      {bookMode === "search" && (
        <>
          <p className="text-sm text-ink-muted">
            Search Google Books to find and add source material.
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
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {pagedResults.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {pagedResults.map((book) => {
                  const key = book.isbn || book.title;
                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 rounded-lg border border-paper-muted p-3"
                    >
                      <BookCover url={book.coverUrl} />
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
                          {book.publishedDate && <span>{book.publishedDate}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleIngestBook(book)}
                        disabled={ingesting === key}
                        className="shrink-0 px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors disabled:opacity-50"
                      >
                        {ingesting === key ? "Adding..." : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {totalResultPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                    disabled={resultPage === 0}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-ink-muted">
                    Page {resultPage + 1} of {totalResultPages}
                  </span>
                  <button
                    onClick={() => setResultPage((p) => p + 1)}
                    disabled={resultPage + 1 >= totalResultPages}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {bookMode === "hardcover" && (
        <>
          <p className="text-sm text-ink-muted">
            Books you marked as &quot;Read&quot; on Hardcover. Add any to your
            source material.
          </p>
          {loadingHardcover ? (
            <p className="text-ink-light text-sm py-4">Loading...</p>
          ) : hardcoverBooks.length === 0 ? (
            <p className="text-ink-light text-sm py-4">No read books found.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">
                {hardcoverTotal} books. Showing{" "}
                {hardcoverPage * PAGE_SIZE + 1}-
                {Math.min((hardcoverPage + 1) * PAGE_SIZE, hardcoverTotal)}.
              </p>
              <div className="space-y-2">
                {hardcoverBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-3 rounded-lg border border-paper-muted p-3"
                  >
                    <BookCover url={book.coverUrl} />
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
                              { month: "short", year: "numeric" },
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
                      className="shrink-0 px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors disabled:opacity-50"
                    >
                      {ingesting === book.title ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
              {hardcoverTotal > PAGE_SIZE && (
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
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodcastAdd({ workspaceId }: { workspaceId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PodcastSearchResult[]>([]);
  const [resultPage, setResultPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [selectedPodcast, setSelectedPodcast] =
    useState<PodcastSearchResult | null>(null);
  const [episodes, setEpisodes] = useState<
    {
      title: string;
      audioUrl: string | null;
      publishedAt: string | null;
      guid: string;
      transcriptUrl: string | null;
    }[]
  >([]);
  const [episodePage, setEpisodePage] = useState(0);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setResultPage(0);
    setSelectedPodcast(null);
    setEpisodes([]);
    setMessage(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/podcast/search?q=${encodeURIComponent(query)}`,
    );
    if (res.ok) setResults(await res.json());
    setSearching(false);
  }

  async function handleSelectPodcast(pod: PodcastSearchResult) {
    setSelectedPodcast(pod);
    setLoadingEpisodes(true);
    setEpisodePage(0);
    setMessage(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/podcast/feed?url=${encodeURIComponent(pod.feedUrl)}`,
    );
    if (res.ok) {
      const feed = await res.json();
      setEpisodes(feed.episodes || []);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to load episodes");
    }
    setLoadingEpisodes(false);
  }

  async function handleIngestEpisode(ep: {
    title: string;
    audioUrl: string | null;
    publishedAt: string | null;
    guid: string;
    transcriptUrl: string | null;
  }) {
    setIngesting(ep.guid);
    setMessage(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/podcast/ingest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ep.title,
          audioUrl: ep.audioUrl,
          publishedAt: ep.publishedAt,
          feedTitle: selectedPodcast?.title,
          transcriptUrl: ep.transcriptUrl,
        }),
      },
    );

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(
        data.queued
          ? `"${ep.title}" queued for transcription + AI analysis.`
          : `"${ep.title}" already added.`,
      );
    } else {
      setMessage(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  const pagedResults = results.slice(
    resultPage * PAGE_SIZE,
    (resultPage + 1) * PAGE_SIZE,
  );
  const totalResultPages = Math.ceil(results.length / PAGE_SIZE);

  const pagedEpisodes = episodes.slice(
    episodePage * PAGE_SIZE,
    (episodePage + 1) * PAGE_SIZE,
  );
  const totalEpisodePages = Math.ceil(episodes.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Search for podcasts on iTunes, then select episodes to transcribe and
        analyze.
      </p>

      {message && (
        <ProcessingBanner
          message={message}
          submessage="Transcription and AI analysis are running in the background."
        />
      )}

      {!selectedPodcast && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search podcasts..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={searching}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {pagedResults.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {pagedResults.map((pod) => (
                  <div
                    key={pod.feedUrl}
                    className="flex items-center gap-3 rounded-lg border border-paper-muted p-3"
                  >
                    {pod.image && (
                      // eslint-disable-next-line @next/next/no-img-element
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
                      onClick={() => handleSelectPodcast(pod)}
                      disabled={loadingEpisodes}
                      className="shrink-0 px-3 py-1 rounded-md border border-ink text-ink text-xs hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                    >
                      View Episodes
                    </button>
                  </div>
                ))}
              </div>
              {totalResultPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                    disabled={resultPage === 0}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-ink-muted">
                    Page {resultPage + 1} of {totalResultPages}
                  </span>
                  <button
                    onClick={() => setResultPage((p) => p + 1)}
                    disabled={resultPage + 1 >= totalResultPages}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedPodcast && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">
                {selectedPodcast.title}
              </p>
              <p className="text-xs text-ink-muted">
                {episodes.length} episodes
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPodcast(null);
                setEpisodes([]);
              }}
              className="text-xs text-ink-muted hover:text-ink"
            >
              Back
            </button>
          </div>
          {loadingEpisodes ? (
            <p className="text-ink-light text-sm py-4">Loading episodes...</p>
          ) : (
            <>
              <div className="space-y-1">
                {pagedEpisodes.map((ep) => (
                  <div
                    key={ep.guid}
                    className="flex items-center justify-between gap-3 rounded-md border border-paper-muted px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink truncate">{ep.title}</p>
                      {ep.publishedAt && (
                        <p className="text-xs text-ink-light">
                          {new Date(ep.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleIngestEpisode(ep)}
                      disabled={ingesting === ep.guid || !ep.audioUrl}
                      className="shrink-0 px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors disabled:opacity-50"
                    >
                      {ingesting === ep.guid
                        ? "Queuing..."
                        : !ep.audioUrl
                          ? "No audio"
                          : "Add"}
                    </button>
                  </div>
                ))}
              </div>
              {totalEpisodePages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setEpisodePage((p) => Math.max(0, p - 1))}
                    disabled={episodePage === 0}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-ink-muted">
                    Page {episodePage + 1} of {totalEpisodePages}
                  </span>
                  <button
                    onClick={() => setEpisodePage((p) => p + 1)}
                    disabled={episodePage + 1 >= totalEpisodePages}
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
    </div>
  );
}

interface YouTubeResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string | null;
  publishedAt: string | null;
}

function YouTubeAdd({ workspaceId }: { workspaceId: string }) {
  const [ytMode, setYtMode] = useState<"search" | "url">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [resultPage, setResultPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setResultPage(0);
    setMessage(null);
    setError(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/youtube/search?q=${encodeURIComponent(query)}`,
    );
    if (res.ok) {
      setResults(await res.json());
    } else {
      const data = await res.json();
      setError(data.error || "Search failed");
    }
    setSearching(false);
  }

  async function handleIngestVideo(videoId: string, title: string) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    setIngesting(videoId);
    setMessage(null);
    setError(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/podcast/ingest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, youtubeUrl: url }),
      },
    );

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(
        data.queued
          ? `"${title}" queued for transcript + AI analysis.`
          : "Already added.",
      );
    } else {
      setError(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  async function handleIngestUrl() {
    if (!youtubeUrl.trim()) return;
    setIngesting("url");
    setMessage(null);
    setError(null);

    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/sources/podcast/ingest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: youtubeUrl, youtubeUrl }),
      },
    );

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(data.queued ? "Video queued." : "Already added.");
      setYoutubeUrl("");
    } else {
      setError(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  const pagedResults = results.slice(
    resultPage * PAGE_SIZE,
    (resultPage + 1) * PAGE_SIZE,
  );
  const totalResultPages = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setYtMode("search")}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${
            ytMode === "search"
              ? "bg-clay text-paper"
              : "text-ink-muted border border-paper-muted hover:text-ink"
          }`}
        >
          Search YouTube
        </button>
        <button
          onClick={() => setYtMode("url")}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${
            ytMode === "url"
              ? "bg-clay text-paper"
              : "text-ink-muted border border-paper-muted hover:text-ink"
          }`}
        >
          Paste URL
        </button>
      </div>

      {message && (
        <ProcessingBanner
          message="YouTube video queued"
          submessage="Transcript extraction and AI analysis are running in the background."
        />
      )}
      {error && <p className="text-sm text-terracotta">{error}</p>}

      {ytMode === "search" && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={searching}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {pagedResults.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {pagedResults.map((vid) => (
                  <div
                    key={vid.videoId}
                    className="flex items-start gap-3 rounded-lg border border-paper-muted p-3"
                  >
                    {vid.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vid.thumbnail}
                        alt=""
                        className="w-28 h-16 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink line-clamp-2">
                        {vid.title}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {vid.channelTitle}
                      </p>
                      {vid.publishedAt && (
                        <p className="text-xs text-ink-light mt-0.5">
                          {new Date(vid.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleIngestVideo(vid.videoId, vid.title)}
                      disabled={ingesting === vid.videoId}
                      className="shrink-0 px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors disabled:opacity-50"
                    >
                      {ingesting === vid.videoId ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
              {totalResultPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                    disabled={resultPage === 0}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-ink-muted">
                    Page {resultPage + 1} of {totalResultPages}
                  </span>
                  <button
                    onClick={() => setResultPage((p) => p + 1)}
                    disabled={resultPage + 1 >= totalResultPages}
                    className="px-3 py-1 rounded-md border border-paper-muted text-xs text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {ytMode === "url" && (
        <div className="space-y-2">
          <p className="text-sm text-ink-muted">
            Paste a YouTube video URL directly.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              disabled={ingesting === "url"}
              onKeyDown={(e) => e.key === "Enter" && handleIngestUrl()}
            />
            <button
              onClick={handleIngestUrl}
              disabled={ingesting === "url" || !youtubeUrl.trim()}
              className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
            >
              {ingesting === "url" ? "Queuing..." : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
