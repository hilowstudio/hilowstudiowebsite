"use client";

import { useEffect, useState, useCallback } from "react";
import type { VoiceGuide, VoiceCategory, ContentPillarRow } from "@/lib/types/database";
import { VOICE_CATEGORIES, HOOK_TYPES, FUNNEL_STAGES } from "@/lib/content-strategy";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { PillarWizard } from "@/components/pillar-wizard";
import { VoiceWizard } from "@/components/voice-wizard";

export function WorkspaceVoiceGuide({
  workspaceId,
  workspaceSlug,
  brandName,
}: {
  workspaceId: string;
  workspaceSlug: string;
  brandName: string;
}) {
  const voiceListUrl = `/api/ops/workspaces/${workspaceId}/voice`;
  const voiceItem = (id: string) => `/api/ops/voice/${id}`;
  const hooksUrl = `/api/ops/workspaces/${workspaceId}/settings/hooks`;
  const pillarsUrl = `/api/ops/workspaces/${workspaceId}/pillars`;

  const voiceWizardUrls = {
    generatePersonaUrl: `/api/ops/workspaces/${workspaceId}/voice/generate-persona`,
    listVoiceUrl: voiceListUrl,
    createVoiceUrl: voiceListUrl,
    voiceItemUrl: voiceItem,
  };
  const pillarWizardUrls = {
    generateUrl: `/api/ops/workspaces/${workspaceId}/pillars/generate`,
    saveUrl: pillarsUrl,
  };

  const [entries, setEntries] = useState<VoiceGuide[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState<VoiceCategory>("principle");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [personaCopied, setPersonaCopied] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [showVoiceWizard, setShowVoiceWizard] = useState(false);

  const [pillars, setPillars] = useState<ContentPillarRow[]>([]);
  const [showPillarWizard, setShowPillarWizard] = useState(false);

  const [enabledHooks, setEnabledHooks] = useState<Set<string>>(new Set());
  const [hooksLoaded, setHooksLoaded] = useState(false);
  const [savingHooks, setSavingHooks] = useState(false);
  const [showHooks, setShowHooks] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(voiceListUrl, { cache: "no-store" });
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, [voiceListUrl]);

  const loadPillars = useCallback(async () => {
    const res = await fetch(pillarsUrl, { cache: "no-store" });
    if (res.ok) setPillars(await res.json());
  }, [pillarsUrl]);

  useEffect(() => {
    load();
    loadPillars();
    fetch(hooksUrl)
      .then((r) => (r.ok ? r.json() : { enabledHooks: [] }))
      .then((json: { enabledHooks: string[] }) => {
        setEnabledHooks(new Set(json.enabledHooks));
        setHooksLoaded(true);
      })
      .catch(() => setHooksLoaded(true));
  }, [load, loadPillars, hooksUrl]);

  function toggleHook(hookValue: string) {
    setEnabledHooks((prev) => {
      const next = new Set(prev);
      if (next.has(hookValue)) next.delete(hookValue);
      else next.add(hookValue);
      return next;
    });
  }

  async function saveHooks() {
    setSavingHooks(true);
    await fetch(hooksUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabledHooks: Array.from(enabledHooks) }),
    });
    setSavingHooks(false);
    setShowHooks(false);
  }

  async function handleAdd() {
    if (!newContent.trim()) return;
    setSaving(true);
    const res = await fetch(voiceListUrl, {
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
    await fetch(voiceItem(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    await fetch(voiceItem(id), { method: "DELETE" });
    load();
  }

  const grouped = VOICE_CATEGORIES.map((cat) => ({
    ...cat,
    items: entries.filter((e) => e.category === cat.value),
  }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl text-ink">
          {brandName} voice guide
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Writing principles, patterns, and reference posts. The standard every
          post gets measured against. Each client has its own voice guide on
          its client page.
        </p>
      </div>

      <section className="rounded-lg border border-paper-muted p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs text-ink-muted uppercase tracking-wide">
              Voice Persona
            </h2>
            <p className="text-xs text-ink-light mt-0.5">
              The system prompt that captures {brandName}&apos;s authentic
              voice. Guides all AI-generated content.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPersona(!showPersona)}
              className="px-3 py-1.5 rounded-md text-xs text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm transition-colors"
            >
              {showPersona ? "Hide" : "View Current"}
            </button>
            <button
              onClick={async () => {
                const principle = entries.find((e) => e.category === "principle");
                const text = principle?.content || PERSONA_SYSTEM_PROMPT;
                await navigator.clipboard.writeText(text);
                setPersonaCopied(true);
                setTimeout(() => setPersonaCopied(false), 2000);
              }}
              className="px-3 py-1.5 rounded-md text-xs text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm transition-colors"
            >
              {personaCopied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setShowVoiceWizard(!showVoiceWizard)}
              className="px-3 py-1.5 rounded-md text-xs bg-clay text-paper hover:bg-clay/90 transition-colors"
            >
              {showVoiceWizard
                ? "Hide Wizard"
                : entries.some((e) => e.category === "principle")
                  ? "Regenerate Voice"
                  : "Create Your Voice"}
            </button>
          </div>
        </div>
        {showPersona && !showVoiceWizard && (
          <pre className="text-xs text-ink font-mono whitespace-pre-wrap bg-paper-warm rounded-md p-4 max-h-96 overflow-y-auto border border-paper-muted">
            {entries.find((e) => e.category === "principle")?.content ||
              PERSONA_SYSTEM_PROMPT}
          </pre>
        )}
        {showVoiceWizard && (
          <VoiceWizard
            urls={voiceWizardUrls}
            onComplete={() => {
              setShowVoiceWizard(false);
              load();
            }}
          />
        )}
      </section>

      <section className="rounded-lg border border-paper-muted p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs text-ink-muted uppercase tracking-wide">
              Content Pillars
            </h2>
            <p className="text-xs text-ink-light mt-0.5">
              {pillars.length > 0
                ? `${pillars.length} pillars defined`
                : "No pillars defined yet"}
            </p>
          </div>
          <button
            onClick={() => setShowPillarWizard(!showPillarWizard)}
            className="px-3 py-1.5 rounded-md text-xs text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm transition-colors"
          >
            {showPillarWizard
              ? "Hide"
              : pillars.length > 0
                ? "Redefine Pillars"
                : "Set Up Pillars"}
          </button>
        </div>

        {!showPillarWizard && pillars.length > 0 && (
          <div className="space-y-2">
            {pillars.map((p) => (
              <div key={p.id} className={`rounded-md px-3 py-2 ${p.color_class}`}>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs opacity-80 mt-0.5">{p.description}</p>
                <p className="text-xs opacity-60 mt-0.5">
                  Funnel role: {p.funnel_role}
                </p>
              </div>
            ))}
          </div>
        )}

        {showPillarWizard && (
          <PillarWizard
            urls={pillarWizardUrls}
            onComplete={() => {
              setShowPillarWizard(false);
              loadPillars();
            }}
          />
        )}
      </section>

      <section className="rounded-lg border border-paper-muted p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs text-ink-muted uppercase tracking-wide">
              Hook Types
            </h2>
            <p className="text-xs text-ink-light mt-0.5">
              {enabledHooks.size} of {HOOK_TYPES.length} enabled
            </p>
          </div>
          <button
            onClick={() => setShowHooks(!showHooks)}
            className="px-3 py-1.5 rounded-md text-xs text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm transition-colors"
          >
            {showHooks ? "Hide" : "Configure"}
          </button>
        </div>

        {showHooks && hooksLoaded && (
          <div className="space-y-5">
            <div className="rounded-md bg-paper-warm/50 px-3 py-3 space-y-2">
              <p className="text-sm text-ink">
                Proven rhetorical devices employed by professional copywriters
                to capture attention. Select the <strong>7 hooks</strong> that
                best represent your authentic brand.
              </p>
              <p className="text-xs text-ink-muted">
                Hook types are subservient to your authentic voice and
                personality. Voice rules always take precedence over any hook
                pattern.
              </p>
            </div>

            {FUNNEL_STAGES.map((stage) => {
              const stageHooks = HOOK_TYPES.filter(
                (h) => h.funnel === stage.value,
              );
              return (
                <div key={stage.value}>
                  <h3 className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
                    {stage.label}
                    <span className="font-normal text-ink-light ml-1">
                      {stage.description}
                    </span>
                  </h3>
                  <div className="space-y-1">
                    {stageHooks.map((hook) => (
                      <label
                        key={hook.value}
                        className={`flex items-start gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors ${
                          enabledHooks.has(hook.value)
                            ? "bg-clay/5 border border-clay/20"
                            : "hover:bg-paper-warm border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabledHooks.has(hook.value)}
                          onChange={() => toggleHook(hook.value)}
                          className="mt-0.5 shrink-0 accent-clay"
                        />
                        <div>
                          <span className="text-sm text-ink font-medium">
                            {hook.label}
                          </span>
                          {hook.humanOnly && (
                            <span className="ml-1.5 text-xs text-ink-light">
                              (human-only)
                            </span>
                          )}
                          <p className="text-xs text-ink-muted mt-0.5">
                            {hook.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2 border-t border-paper-muted">
              <p className="text-xs text-ink-muted">
                {enabledHooks.size} selected
                {enabledHooks.size !== 7 && (
                  <span className="text-clay ml-1">(7 recommended)</span>
                )}
              </p>
              <button
                onClick={saveHooks}
                disabled={savingHooks}
                className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
              >
                {savingHooks ? "Saving..." : "Save Hook Preferences"}
              </button>
            </div>
          </div>
        )}
      </section>

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
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
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
                  ? "e.g., \"Never use 'leveraging', 'synergy', or 'disrupting'. Dead words.\""
                  : "Paste a LinkedIn post that nails the voice..."
          }
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y font-mono"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newContent.trim()}
          className="px-4 py-2 rounded-md bg-clay text-paper text-sm hover:bg-clay/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </section>

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
              <p className="text-ink-light text-sm py-2">No entries yet.</p>
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
                            className="px-3 py-1 rounded-md bg-clay text-paper text-xs hover:bg-clay/90 transition-colors"
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
                        <p
                          className={`text-sm text-ink flex-1 whitespace-pre-wrap ${
                            group.value === "reference_post"
                              ? "font-mono text-xs"
                              : ""
                          }`}
                        >
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
