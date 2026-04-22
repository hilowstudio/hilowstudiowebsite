"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
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

export function WorkspaceContentList({
  workspaceId,
  workspaceSlug,
  brandName,
}: {
  workspaceId: string;
  workspaceSlug: string;
  brandName: string;
}) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url =
        filter === "all"
          ? `/api/ops/workspaces/${workspaceId}/content`
          : `/api/ops/workspaces/${workspaceId}/content?status=${filter}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) setPosts(await res.json());
      setLoading(false);
    }
    load();
  }, [filter, workspaceId]);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">{brandName} content</h1>
          <p className="text-sm text-ink-light mt-1 measure">
            Posts published on {brandName}&apos;s own LinkedIn. For a
            client&apos;s content, open their client page.
          </p>
        </div>
        <div className="flex items-baseline gap-3 text-sm">
          <Link
            href={`/w/${workspaceSlug}/content/calendar`}
            className="text-clay hover:text-ink transition-colors"
          >
            Calendar
          </Link>
          <span className="text-ink-light">&middot;</span>
          <Link
            href={`/w/${workspaceSlug}/content/analytics`}
            className="text-clay hover:text-ink transition-colors"
          >
            Analytics
          </Link>
          <span className="text-ink-light">&middot;</span>
          <Link
            href={`/w/${workspaceSlug}/idea-sources`}
            className="text-clay hover:text-ink transition-colors"
          >
            Sources
          </Link>
        </div>
      </header>

      <div className="flex gap-3 text-sm">
        <Link
          href={`/w/${workspaceSlug}/voice`}
          className="text-clay hover:text-ink transition-colors"
        >
          Voice guide
        </Link>
        <span className="text-ink-light">&middot;</span>
        <Link
          href={`/w/${workspaceSlug}/pillars`}
          className="text-clay hover:text-ink transition-colors"
        >
          Pillars
        </Link>
        <span className="text-ink-light">&middot;</span>
        <Link
          href={`/w/${workspaceSlug}/prompts`}
          className="text-clay hover:text-ink transition-colors"
        >
          Prompt library
        </Link>
      </div>

      <div className="flex justify-center border-b border-paper-muted -mb-px">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-5 py-2.5 text-sm transition-colors border-b-2 ${
              filter === tab.value
                ? "border-clay text-clay font-medium"
                : "border-transparent text-ink-muted hover:text-ink hover:border-clay-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2 space-y-2">
        <Link
          href={`/w/${workspaceSlug}/content/new`}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-clay-muted p-6 text-center hover:bg-paper-warm hover:border-clay transition-colors"
        >
          <Plus size={24} weight="regular" className="text-clay" />
          <span className="text-sm font-medium text-ink">New post</span>
        </Link>

        {loading ? (
          <p className="text-ink-light text-sm py-8">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-ink-light text-sm py-8 text-center">
            No posts yet. Create your first one above.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/w/${workspaceSlug}/content/${post.id}`}
              className="flex items-start justify-between rounded-lg border border-paper-muted p-4 hover:bg-paper-warm/50 transition-colors"
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
                  <span className="text-xs text-ink-light">
                    {post.post_type}
                  </span>
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
          ))
        )}
      </div>
    </div>
  );
}
