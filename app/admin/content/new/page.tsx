"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostType } from "@/lib/types/database";

const postTypes: { value: PostType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "carousel", label: "Carousel" },
  { value: "poll", label: "Poll" },
  { value: "article", label: "Article" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(status: "draft" | "scheduled") {
    if (!body.trim()) {
      setError("Post body is required");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      setError("Select a publish date to schedule");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || null,
        body,
        post_type: postType,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        status,
      }),
    });

    if (res.ok) {
      router.push("/admin/content");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
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

      <div className="space-y-4">
        <div>
          <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Internal reference title..."
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay"
          />
        </div>

        <div>
          <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
            Post Body *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Write your LinkedIn post..."
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y font-mono"
          />
          <p className="text-xs text-ink-light mt-1">
            {body.length} characters
            {body.length > 0 && body.length < 900 && " — aim for 900-1,500 for best reach"}
            {body.length >= 900 && body.length <= 1500 && " — sweet spot"}
            {body.length > 1500 && " — consider trimming"}
          </p>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
              Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              {postTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
              Schedule For
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            />
          </div>
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-md border border-paper-muted text-ink text-sm hover:bg-paper-warm transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("scheduled")}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
