"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  ContentIdea,
} from "@/lib/types/database";
import {
  IDEA_SOURCES,
} from "@/lib/content-strategy";
import type { BookMetadata } from "@/lib/sources/google-books";
import type { HardcoverBook } from "@/lib/sources/hardcover";
import type { PodcastSearchResult } from "@/lib/sources/itunes";
import type { FeedEpisode, ParsedFeed } from "@/lib/sources/rss";

const sourceColors: Record<string, string> = {
  book: "bg-moss/15 text-moss",
  podcast: "bg-clay/15 text-clay",
  youtube: "bg-terracotta/15 text-terracotta",
  article: "bg-ink/10 text-ink",
  repurpose: "bg-clay-muted/20 text-clay",
  personal: "bg-paper-muted text-ink-muted",
  external: "bg-paper-muted text-ink-muted",
};

const PAGE_SIZE = 10;

// ─── Main page ────────────────────────────────────────────

export default function SourceMaterialPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-ink">Source Material</h1>
        <p className="text-sm text-ink-muted mt-1">
          Gather source material for content inspiration.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wide mb-4">
          Add Sources
        </h2>
        <AddSources />
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wide mb-4">
          My Sources
        </h2>
        <MySources />
      </section>
    </div>
  );
}

// ─── Add Sources ──────────────────────────────────────────

type AddMode = "books" | "podcasts" | "articles";

function AddSources() {
  const [mode, setMode] = useState<AddMode>("books");

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {([
          { value: "books" as const, label: "Books" },
          { value: "podcasts" as const, label: "Podcasts & YouTube" },
          { value: "articles" as const, label: "Articles / URLs" },
        ]).map((tab) => (
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

      {mode === "books" && <BookAdd />}
      {mode === "podcasts" && <PodcastAdd />}
      {mode === "articles" && <ArticleAdd />}
    </div>
  );
}

// ─── My Sources ───────────────────────────────────────────

type SourceTab = "book" | "podcast" | "youtube" | "article" | "repurpose" | "hidden";

function MySources() {
  const [tab, setTab] = useState<SourceTab>("book");
  const [sources, setSources] = useState<ContentIdea[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const isHidden = tab === "hidden";
    const status = isHidden ? "hidden" : "active";
    const sourceParam = isHidden ? "" : `&source=${tab}`;
    const res = await fetch(
      `/api/admin/ideas?status=${status}${sourceParam}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      setSources(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [tab, page]);

  // Load hidden count for badge
  const loadHiddenCount = useCallback(async () => {
    const res = await fetch(
      "/api/admin/ideas?status=hidden&count=true",
      { cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      setHiddenCount(json.count || 0);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadHiddenCount();
  }, [loadHiddenCount]);

  async function hideSource(id: string) {
    setActionLoading(id);
    await fetch(`/api/admin/ideas/${id}`, {
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
    await fetch(`/api/admin/ideas/${id}`, {
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
    await fetch(`/api/admin/ideas/${id}`, { method: "DELETE" });
    await load();
    await loadHiddenCount();
    setActionLoading(null);
  }

  const tabs: { value: SourceTab; label: string }[] = [
    { value: "book", label: "Books" },
    { value: "podcast", label: "Podcasts" },
    { value: "youtube", label: "YouTube" },
    { value: "article", label: "Articles" },
    { value: "repurpose", label: "Repurpose" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(0); }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              tab === t.value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {t.label}
          </button>
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => { setTab("hidden"); setPage(0); }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              tab === "hidden"
                ? "bg-ink text-paper"
                : "text-ink-light hover:text-ink hover:bg-paper-warm"
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        )}
      </div>

      {tab === "hidden" && (
        <p className="text-xs text-ink-muted bg-paper-warm/50 rounded-md px-3 py-2">
          Hidden sources are excluded from the Content Generator but remain in
          your account. You can unhide them at any time, or permanently delete
          them here.
        </p>
      )}

      {loading ? (
        <p className="text-ink-light text-sm py-6">Loading...</p>
      ) : sources.length === 0 ? (
        <p className="text-ink-light text-sm py-6">
          {tab === "hidden"
            ? "No hidden sources."
            : "No sources yet. Add some above."}
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
                            {IDEA_SOURCES.find((s) => s.value === src.source)
                              ?.label || src.source}
                          </span>
                        </div>
                      </div>

                      {/* Takeaways preview */}
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

                  {/* Actions */}
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

          {/* Pagination */}
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
                disabled={
                  (page + 1) * PAGE_SIZE >= total || loading
                }
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

// ─── Article add ──────────────────────────────────────────

function ArticleAdd() {
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
      setResult(
        "Queued for processing. It will appear in My Sources shortly."
      );
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
        Paste a URL. The AI will read the page, summarize it, and add it to
        your sources.
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
          {loading ? "Queuing..." : "Add"}
        </button>
      </div>
      {result && <p className="text-sm text-moss">{result}</p>}
      {error && <p className="text-sm text-terracotta">{error}</p>}
    </div>
  );
}

// ─── Book add (Hardcover + Google Books) ──────────────────

function BookAdd() {
  const [bookMode, setBookMode] = useState<"hardcover" | "search">(
    "hardcover"
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
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
      `/api/admin/sources/hardcover?limit=${PAGE_SIZE}&offset=${pg * PAGE_SIZE}`,
      { cache: "no-store" }
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
    setIngesting(book.title);
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

  function BookCover({ url }: { url: string | null }) {
    if (url) {
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

  return (
    <div className="space-y-4">
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

      {bookMode === "hardcover" && (
        <>
          <p className="text-sm text-ink-muted">
            Books you marked as "Read" on Hardcover. Add any to your source
            material.
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
                {Math.min(
                  (hardcoverPage + 1) * PAGE_SIZE,
                  hardcoverTotal
                )}
                .
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
                            {new Date(
                              book.lastReadDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
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
              {hardcoverTotal > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() =>
                      setHardcoverPage((p) => Math.max(0, p - 1))
                    }
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
                        {book.pageCount && (
                          <span>{book.pageCount} pages</span>
                        )}
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
    </div>
  );
}

// ─── Podcast & YouTube add ────────────────────────────────

function PodcastAdd() {
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
    if (res.ok) setPodcastResults(await res.json());
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
          : `"${ep.title}" already added.`
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
      body: JSON.stringify({ title: youtubeUrl, youtubeUrl }),
    });

    const data = await res.json();
    if (res.ok || res.status === 200) {
      setMessage(
        data.queued
          ? "YouTube video queued for transcript + AI analysis."
          : "Already added."
      );
      setYoutubeUrl("");
    } else {
      setMessage(data.error || "Failed to ingest");
    }
    setIngesting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([
          { value: "search" as const, label: "Search Podcasts" },
          { value: "rss" as const, label: "RSS Feed" },
          { value: "youtube" as const, label: "YouTube" },
        ]).map((m) => (
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
              {ingesting === "youtube" ? "Queuing..." : "Add"}
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
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
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
                      : "Add"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
