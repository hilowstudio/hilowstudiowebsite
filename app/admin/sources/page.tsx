"use client";

import { useState } from "react";
import type { BookMetadata } from "@/lib/sources/google-books";
import type { PodcastSearchResult } from "@/lib/sources/itunes";
import type { FeedEpisode, ParsedFeed } from "@/lib/sources/rss";

type Tab = "articles" | "books" | "podcasts";

const tabs: { value: Tab; label: string }[] = [
  { value: "articles", label: "Articles" },
  { value: "books", label: "Books" },
  { value: "podcasts", label: "Podcasts & YouTube" },
];

export default function SourcesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ink">Sources</h1>

      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === tab.value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "articles" && <ArticleTab />}
      {activeTab === "books" && <BookTab />}
      {activeTab === "podcasts" && <PodcastTab />}
    </div>
  );
}

// ─── Articles ─────────────────────────────────────────────

function ArticleTab() {
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
      setResult("Queued for processing. Check Ideas in a few seconds.");
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
        Paste a URL. The AI will fetch the page, summarize it, and create an
        idea in your bank.
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
      {result && (
        <p className="text-sm text-moss">{result}</p>
      )}
      {error && (
        <p className="text-sm text-terracotta">{error}</p>
      )}
    </section>
  );
}

// ─── Books ────────────────────────────────────────────────

function BookTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [searching, setSearching] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  async function handleIngest(book: BookMetadata) {
    const key = book.isbn || book.title;
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
      <p className="text-sm text-ink-muted">
        Search Google Books. Select a title to generate an AI summary and add it
        to your idea bank.
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

      {message && (
        <p className="text-sm text-moss">{message}</p>
      )}

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
                    {book.publishedDate && <span>{book.publishedDate}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleIngest(book)}
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
    </section>
  );
}

// ─── Podcasts & YouTube ───────────────────────────────────

function PodcastTab() {
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
      {/* Sub-mode tabs */}
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

      {message && (
        <p className="text-sm text-moss">{message}</p>
      )}

      {/* Search podcasts */}
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
              onKeyDown={(e) => e.key === "Enter" && handlePodcastSearch()}
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

      {/* RSS feed URL */}
      {mode === "rss" && !feed && (
        <div className="flex gap-2">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="Paste RSS feed URL..."
            className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            disabled={loadingFeed}
            onKeyDown={(e) => e.key === "Enter" && handleLoadFeed(feedUrl)}
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

      {/* YouTube URL */}
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
              onKeyDown={(e) => e.key === "Enter" && handleYouTubeIngest()}
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

      {/* Episode list (from search or RSS) */}
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
