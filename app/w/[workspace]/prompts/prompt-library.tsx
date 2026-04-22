"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  prompt_body: string;
  category: string;
  sort_order: number;
  workspace_id: string | null;
};

export function PromptLibrary({
  workspaceId,
  workspaceTemplates,
  platformTemplates,
}: {
  workspaceId: string;
  workspaceTemplates: Template[];
  platformTemplates: Template[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    label: "",
    description: "",
    prompt_body: "",
    category: "general",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Template | null>(null);

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.prompt_body.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/prompt-templates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          description: form.description.trim() || null,
          prompt_body: form.prompt_body.trim(),
          category: form.category,
          sort_order: workspaceTemplates.length,
        }),
      },
    );
    if (res.ok) {
      setForm({ label: "", description: "", prompt_body: "", category: "general" });
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not add");
    }
    setBusy(false);
  }

  async function saveEdit() {
    if (!editDraft) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/prompt-templates/${editDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: editDraft.label,
        description: editDraft.description,
        prompt_body: editDraft.prompt_body,
        category: editDraft.category,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditDraft(null);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Save failed");
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/ops/prompt-templates/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Delete failed");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="space-y-8">
      {workspaceTemplates.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg text-ink">Your templates</h2>
          <ul className="space-y-3">
            {workspaceTemplates.map((t) =>
              editingId === t.id && editDraft ? (
                <li
                  key={t.id}
                  className="rounded-md border border-clay bg-paper-warm/80 p-4 space-y-2"
                >
                  <input
                    type="text"
                    value={editDraft.label}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, label: e.target.value })
                    }
                    className={`${inputClass} font-serif`}
                  />
                  <input
                    type="text"
                    value={editDraft.description ?? ""}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        description: e.target.value || null,
                      })
                    }
                    placeholder="Short description"
                    className={inputClass}
                  />
                  <textarea
                    value={editDraft.prompt_body}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, prompt_body: e.target.value })
                    }
                    rows={6}
                    className={`${inputClass} resize-y measure`}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft(null);
                      }}
                      className="px-3 py-1.5 rounded-md text-ink-muted hover:text-ink text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={t.id}
                  className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2"
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="font-serif text-base text-ink">{t.label}</p>
                      {t.description && (
                        <p className="text-xs text-ink-light">{t.description}</p>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft(t);
                        }}
                        className="text-ink-light hover:text-ink transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="text-ink-light hover:text-terracotta transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap measure">
                    {t.prompt_body}
                  </p>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Platform library</h2>
        <p className="text-sm text-ink-muted">
          Read-only. Duplicate into your workspace to customize.
        </p>
        <ul className="space-y-2">
          {platformTemplates.map((t) => (
            <li
              key={t.id}
              className="rounded-md border border-paper-muted bg-paper-warm/30 p-4 space-y-2"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-serif text-base text-ink">{t.label}</p>
                  {t.description && (
                    <p className="text-xs text-ink-light">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch(
                      `/api/ops/workspaces/${workspaceId}/prompt-templates`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          label: `${t.label} (copy)`,
                          description: t.description,
                          prompt_body: t.prompt_body,
                          category: t.category,
                          sort_order: workspaceTemplates.length,
                        }),
                      },
                    );
                    if (res.ok) router.refresh();
                  }}
                  className="text-xs text-clay hover:text-ink transition-colors"
                >
                  Duplicate to workspace
                </button>
              </div>
              <p className="text-sm text-ink-muted whitespace-pre-wrap measure">
                {t.prompt_body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-md border border-paper-muted bg-paper-warm/30 p-4">
        <h2 className="font-serif text-lg text-ink">Add a template</h2>
        <form onSubmit={addTemplate} className="space-y-3">
          <div>
            <label className={labelClass}>Label *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Weekly retrospective post"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Short description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Prompt *</label>
            <textarea
              value={form.prompt_body}
              onChange={(e) =>
                setForm((p) => ({ ...p, prompt_body: e.target.value }))
              }
              rows={5}
              placeholder="The instructions the AI will follow when this template is chosen."
              className={`${inputClass} resize-y measure`}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              className="px-2 py-1 rounded border border-paper-muted bg-paper text-ink text-sm"
            >
              <option value="general">General</option>
              <option value="story">Story</option>
              <option value="opinion">Opinion</option>
              <option value="tactical">Tactical</option>
              <option value="announcement">Announcement</option>
            </select>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={busy || !form.label.trim() || !form.prompt_body.trim()}
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              Add template
            </button>
          </div>
          {error && <p className="text-terracotta text-sm">{error}</p>}
        </form>
      </section>
    </div>
  );
}
