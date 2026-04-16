"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/studio/queries";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NoteList({
  projectId,
  notes,
}: {
  projectId: string;
  notes: Note[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/studio/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save note");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/studio/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-lg text-ink">Notes</h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Meeting notes, decisions, rough thinking..."
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y measure"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !body.trim()}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            Save note
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-ink-light">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group rounded-md border border-paper-muted bg-paper-warm/60 p-3"
            >
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs text-ink-light">
                  {formatDate(note.created_at)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-ink-light hover:text-terracotta transition-opacity"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap measure">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
