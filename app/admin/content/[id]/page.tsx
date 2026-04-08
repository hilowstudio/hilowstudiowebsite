"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ContentPost, PostType } from "@/lib/types/database";

const postTypes: { value: PostType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "carousel", label: "Carousel" },
  { value: "poll", label: "Poll" },
  { value: "article", label: "Article" },
];

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ContentPost | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/content/${id}`);
      if (res.ok) {
        const data: ContentPost = await res.json();
        setPost(data);
        setTitle(data.title || "");
        setBody(data.body);
        setPostType(data.post_type);
        if (data.scheduled_at) {
          setScheduledAt(
            new Date(data.scheduled_at).toISOString().slice(0, 16)
          );
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(status?: string) {
    setSaving(true);
    setError("");

    const updates: Record<string, unknown> = {
      title: title || null,
      body,
      post_type: postType,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };
    if (status) updates.status = status;

    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updated = await res.json();
      setPost(updated);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
    router.push("/admin/content");
  }

  if (loading) return <p className="text-ink-light text-sm py-8">Loading...</p>;
  if (!post) return <p className="text-terracotta text-sm py-8">Post not found.</p>;

  const isEditable = post.status === "draft" || post.status === "scheduled" || post.status === "failed";

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/admin/content")}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Content
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Edit Post</h1>
        <span className="text-xs text-ink-muted">
          {post.status}
          {post.published_at &&
            ` · ${new Date(post.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}`}
        </span>
      </div>

      {post.error_message && (
        <div className="rounded-md bg-terracotta/10 border border-terracotta/20 p-3">
          <p className="text-sm text-terracotta">{post.error_message}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!isEditable}
            rows={10}
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y font-mono disabled:opacity-60"
          />
          <p className="text-xs text-ink-light mt-1">{body.length} characters</p>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
              Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              disabled={!isEditable}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay disabled:opacity-60"
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
              disabled={!isEditable}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay disabled:opacity-60"
            />
          </div>
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        {isEditable && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-paper-muted text-ink text-sm hover:bg-paper-warm transition-colors disabled:opacity-50"
            >
              Save
            </button>
            {(post.status === "draft" || post.status === "failed") && (
              <button
                onClick={() => handleSave("scheduled")}
                disabled={saving || !scheduledAt}
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
              >
                Schedule
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md text-terracotta text-sm hover:bg-terracotta/10 transition-colors ml-auto"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
