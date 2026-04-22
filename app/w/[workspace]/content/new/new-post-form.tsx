"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkVoiceViolations } from "@/lib/voice-persona";

type Template = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  prompt_body: string;
  category: string;
};

export function NewWorkspacePostForm({
  workspaceId,
  workspaceSlug,
  templates,
}: {
  workspaceId: string;
  workspaceSlug: string;
  templates: Template[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [prompt, setPrompt] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  const violations = checkVoiceViolations(body);

  async function draft() {
    if (!prompt.trim()) return;
    setDrafting(true);
    setError("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/content/draft`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { body: string };
      setBody(data.body);
    } else {
      const data = await res.json();
      setError(data.error || "Draft failed");
    }
    setDrafting(false);
  }

  async function save(publish: boolean) {
    if (!body.trim()) return;
    setBusy(true);
    setError("");

    const createRes = await fetch(
      `/api/ops/workspaces/${workspaceId}/content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          body,
          scheduled_at: scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
          status: publish ? "draft" : scheduledAt ? "scheduled" : "draft",
        }),
      },
    );
    if (!createRes.ok) {
      const data = await createRes.json();
      setError(data.error || "Create failed");
      setBusy(false);
      return;
    }
    const post = (await createRes.json()) as { id: string };

    if (publish) {
      const pubRes = await fetch(`/api/ops/content-posts/${post.id}/publish`, {
        method: "POST",
      });
      if (!pubRes.ok) {
        const data = await pubRes.json();
        setError(data.error || "Publish failed");
        router.push(`/w/${workspaceSlug}/content/${post.id}`);
        setBusy(false);
        return;
      }
    }

    router.push(`/w/${workspaceSlug}/content/${post.id}`);
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-md border border-paper-muted bg-paper-warm/60 p-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide">
          Draft with AI (optional)
        </p>
        {templates.length > 0 && (
          <div>
            <label className={labelClass}>Start from a template</label>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                const t = templates.find((x) => x.id === e.target.value);
                if (t) setPrompt(t.prompt_body);
              }}
              className={inputClass}
            >
              <option value="">(None)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="What's this post about? The workspace voice guide is used for the draft."
          className={`${inputClass} resize-y`}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={draft}
            disabled={drafting || !prompt.trim()}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {drafting ? "Drafting..." : "Draft"}
          </button>
        </div>
      </section>

      <div>
        <label className={labelClass}>Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Body *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className={`${inputClass} resize-y measure font-serif text-base`}
          placeholder="Write the post, or generate one above and edit to taste."
        />
        {violations.length > 0 && (
          <p className="text-xs text-terracotta mt-2">
            Voice check: {violations.join(", ")}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>Schedule (optional)</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={busy || !body.trim()}
          className="px-4 py-2 rounded-md text-ink-muted hover:text-ink text-sm transition-colors disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={busy || !body.trim()}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {busy ? "Publishing..." : "Publish now"}
        </button>
      </div>
    </div>
  );
}
