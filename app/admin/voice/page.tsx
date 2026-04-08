"use client";

import { useEffect, useState } from "react";
import type { VoiceGuide, VoiceCategory } from "@/lib/types/database";
import { VOICE_CATEGORIES } from "@/lib/content-strategy";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";

export default function VoiceGuidePage() {
  const [entries, setEntries] = useState<VoiceGuide[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry form
  const [newCategory, setNewCategory] = useState<VoiceCategory>("principle");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Persona copy state
  const [personaCopied, setPersonaCopied] = useState(false);
  const [showPersona, setShowPersona] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/voice");
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!newContent.trim()) return;
    setSaving(true);

    const res = await fetch("/api/admin/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategory,
        content: newContent,
        sort_order: entries.filter((e) => e.category === newCategory).length,
      }),
    });

    if (res.ok) {
      setNewContent("");
      load();
    }
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editContent.trim()) return;
    await fetch(`/api/admin/voice/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    await fetch(`/api/admin/voice/${id}`, { method: "DELETE" });
    load();
  }

  // Group by category
  const grouped = VOICE_CATEGORIES.map((cat) => ({
    ...cat,
    items: entries.filter((e) => e.category === cat.value),
  }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl text-ink">Voice Guide</h1>
        <p className="text-sm text-ink-muted mt-1">
          Your writing principles, patterns, and reference posts. This is the
          standard every post gets measured against.
        </p>
      </div>

      {/* AI Persona */}
      <section className="rounded-lg border border-paper-muted p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs text-ink-muted uppercase tracking-wide">
              AI Persona — The Calm Integrator
            </h2>
            <p className="text-xs text-ink-light mt-0.5">
              System prompt for Claude. Paste this when generating content in your voice.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPersona(!showPersona)}
              className="px-3 py-1.5 rounded-md text-xs text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm transition-colors"
            >
              {showPersona ? "Hide" : "View"}
            </button>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(PERSONA_SYSTEM_PROMPT);
                setPersonaCopied(true);
                setTimeout(() => setPersonaCopied(false), 2000);
              }}
              className="px-3 py-1.5 rounded-md text-xs bg-ink text-paper hover:bg-ink-muted transition-colors"
            >
              {personaCopied ? "Copied" : "Copy System Prompt"}
            </button>
          </div>
        </div>
        {showPersona && (
          <pre className="text-xs text-ink font-mono whitespace-pre-wrap bg-paper-warm rounded-md p-4 max-h-96 overflow-y-auto border border-paper-muted">
            {PERSONA_SYSTEM_PROMPT}
          </pre>
        )}
      </section>

      {/* Add new entry */}
      <section className="rounded-lg border border-paper-muted p-4 space-y-3">
        <h2 className="text-xs text-ink-muted uppercase tracking-wide">
          Add Entry
        </h2>
        <div className="flex gap-3 items-end">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as VoiceCategory)}
              className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
            >
              {VOICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          placeholder={
            newCategory === "principle"
              ? 'e.g., "Write like you talk to a smart friend over coffee. No jargon. No posturing."'
              : newCategory === "do"
              ? 'e.g., "Use short paragraphs. One idea per paragraph."'
              : newCategory === "dont"
              ? 'e.g., "Never use \'leveraging\', \'synergy\', or \'disrupting\'. Dead words."'
              : 'Paste a LinkedIn post you wrote that nails your voice...'
          }
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y font-mono"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newContent.trim()}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </section>

      {/* Grouped entries */}
      {loading ? (
        <p className="text-ink-light text-sm py-8">Loading...</p>
      ) : (
        grouped.map((group) => (
          <section key={group.value}>
            <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
              {group.label}
              <span className="text-ink-light ml-2">({group.items.length})</span>
            </h2>
            {group.items.length === 0 ? (
              <p className="text-ink-light text-sm py-2">
                No entries yet.
              </p>
            ) : (
              <div className="space-y-2">
                {group.items.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-paper-muted p-3 group"
                  >
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(entry.id)}
                            className="px-3 py-1 rounded-md bg-ink text-paper text-xs hover:bg-ink-muted transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-md text-xs text-ink-muted hover:text-ink transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-sm text-ink flex-1 whitespace-pre-wrap ${
                          group.value === "reference_post" ? "font-mono text-xs" : ""
                        }`}>
                          {entry.content}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditContent(entry.content);
                            }}
                            className="px-2 py-1 rounded text-xs text-ink-light hover:text-ink hover:bg-paper-warm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="px-2 py-1 rounded text-xs text-ink-light hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
