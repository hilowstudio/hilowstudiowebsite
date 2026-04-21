"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostBodyEditor({
  postId,
  initialTitle,
  initialBody,
  canEdit,
}: {
  postId: string;
  initialTitle: string | null;
  initialBody: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/content-posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || null,
        body,
      }),
    });
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not save");
    }
    setSaving(false);
  }

  function cancel() {
    setTitle(initialTitle ?? "");
    setBody(initialBody);
    setEditing(false);
    setError("");
  }

  if (!editing) {
    return (
      <section className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2">
        {initialTitle && (
          <p className="font-serif text-base text-ink">{initialTitle}</p>
        )}
        <p className="text-sm text-ink whitespace-pre-wrap measure">
          {initialBody}
        </p>
        {canEdit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-clay hover:text-ink transition-colors"
            >
              Edit post
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-md border border-clay bg-paper-warm/80 p-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
        className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y measure font-serif"
      />
      {error && <p className="text-terracotta text-sm">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={cancel}
          className="px-3 py-1.5 rounded-md text-ink-muted hover:text-ink text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !body.trim()}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </section>
  );
}
