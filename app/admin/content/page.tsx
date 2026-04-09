"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GenerateDraftModal } from "@/components/generate-draft-modal";
import type { ContentPost, PostStatus } from "@/lib/types/database";

const statusTabs: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

const statusColors: Record<PostStatus, string> = {
  draft: "bg-paper-muted text-ink-muted",
  scheduled: "bg-clay-muted/20 text-clay",
  publishing: "bg-clay/20 text-clay",
  published: "bg-moss/20 text-moss",
  failed: "bg-terracotta/20 text-terracotta",
};

export default function ContentPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url =
        filter === "all"
          ? "/api/admin/content"
          : `/api/admin/content?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) setPosts(await res.json());
      setLoading(false);
    }
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Content</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenerateOpen(true)}
            className="px-3 py-1.5 rounded-md border border-ink text-ink text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            Generate draft
          </button>
          <Link
            href="/admin/content/new"
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
          >
            New post
          </Link>
        </div>
      </div>

      <GenerateDraftModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
      />

      {/* Status tabs */}
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

      {/* Posts list */}
      {loading ? (
        <p className="text-ink-light text-sm py-8">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-ink-light text-sm py-8">No posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/content/${post.id}`}
              className="flex items-start justify-between rounded-lg border border-paper-muted p-4 hover:bg-paper-warm/50 transition-colors block"
            >
              <div className="min-w-0 flex-1">
                {post.title && (
                  <p className="text-sm font-medium text-ink mb-1">
                    {post.title}
                  </p>
                )}
                <p className="text-sm text-ink-muted line-clamp-2">
                  {post.body.slice(0, 150)}
                  {post.body.length > 150 ? "..." : ""}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-ink-light">{post.post_type}</span>
                  {post.scheduled_at && (
                    <span className="text-xs text-ink-light">
                      {new Date(post.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 ml-4 px-2 py-0.5 rounded-full text-xs ${statusColors[post.status]}`}
              >
                {post.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
