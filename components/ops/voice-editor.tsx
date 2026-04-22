"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VoiceRow = {
  id: string;
  category: string;
  content: string;
  sort_order: number;
};

export function VoiceEditor({
  addUrl,
  initial,
}: {
  addUrl: string;
  initial: VoiceRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [newContent, setNewContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addRow() {
    if (!newContent.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newContent,
        sort_order: rows.length,
      }),
    });
    if (res.ok) {
      const row = (await res.json()) as VoiceRow;
      setRows((prev) => [...prev, row]);
      setNewContent("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not add");
    }
    setBusy(false);
  }

  async function saveEdit(id: string) {
    if (!draft.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/voice/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, content: draft } : r)),
      );
      setEditing(null);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not save");
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this principle?")) return;
    const res = await fetch(`/api/ops/voice/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not delete");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <p className="text-sm text-ink-light">
          No voice principles yet. Add one below.
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
          >
            {editing === row.id ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 rounded-md text-ink-muted hover:text-ink text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(row.id)}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {row.content}
                </p>
                <div className="flex gap-3 text-xs justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(row.id);
                      setDraft(row.content);
                    }}
                    className="text-ink-light hover:text-ink transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    className="text-ink-light hover:text-terracotta transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2 pt-2 border-t border-paper-muted">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          placeholder="Add a voice principle (e.g. 'Prefer concrete verbs. Cut every adjective that didn't earn its spot.')"
          className={`${inputClass} resize-y`}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addRow}
            disabled={busy || !newContent.trim()}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
