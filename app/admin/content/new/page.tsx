"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PostType, HookType, FunnelStage, ContentPillar, VoiceGuide } from "@/lib/types/database";
import { HOOK_TYPES, FUNNEL_STAGES, CONTENT_PILLARS, VOICE_CATEGORIES } from "@/lib/content-strategy";
import { checkVoiceViolations, PERSONA_SIDEBAR_PRINCIPLES } from "@/lib/voice-persona";

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
  const [hookType, setHookType] = useState<HookType | "">("");
  const [funnelStage, setFunnelStage] = useState<FunnelStage | "">("");
  const [contentPillar, setContentPillar] = useState<ContentPillar | "">("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Voice guide panel
  const [voiceEntries, setVoiceEntries] = useState<VoiceGuide[]>([]);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    fetch("/api/admin/voice")
      .then((r) => r.ok ? r.json() : [])
      .then(setVoiceEntries)
      .catch(() => {});
  }, []);

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
        hook_type: hookType || null,
        funnel_stage: funnelStage || null,
        content_pillar: contentPillar || null,
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

  const violations = useMemo(() => checkVoiceViolations(body), [body]);

  const voiceGrouped = VOICE_CATEGORIES.map((cat) => ({
    ...cat,
    items: voiceEntries.filter((e) => e.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex gap-6">
      {/* Main editor */}
      <div className="max-w-2xl flex-1 space-y-6">
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
              {body.length > 0 && body.length < 900 && ". Aim for 900-1,500 for best reach"}
              {body.length >= 900 && body.length <= 1500 && ". Sweet spot"}
              {body.length > 1500 && ". Consider trimming"}
            </p>
            {violations.length > 0 && (
              <div className="mt-2 rounded-md bg-terracotta/10 border border-terracotta/20 px-3 py-2">
                <p className="text-xs text-terracotta font-medium">Voice check — banned words detected:</p>
                <p className="text-xs text-terracotta/80 mt-0.5">
                  {violations.map((v, i) => (
                    <span key={v}>
                      {i > 0 && " · "}
                      <span className="font-mono">{v}</span>
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
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

          {/* Hook type selector */}
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-2">
              Hook Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {HOOK_TYPES.map((hook) => (
                <button
                  key={hook.value}
                  type="button"
                  onClick={() =>
                    setHookType(hookType === hook.value ? "" : hook.value)
                  }
                  title={hook.description}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    hookType === hook.value
                      ? "bg-ink text-paper"
                      : "text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm"
                  }`}
                >
                  {hook.label}
                </button>
              ))}
            </div>
            {hookType && (
              <p className="text-xs text-ink-light mt-1.5">
                {HOOK_TYPES.find((h) => h.value === hookType)?.description}
              </p>
            )}
          </div>

          {/* Funnel stage selector */}
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-2">
              Funnel Stage
            </label>
            <div className="flex gap-2">
              {FUNNEL_STAGES.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() =>
                    setFunnelStage(funnelStage === stage.value ? "" : stage.value)
                  }
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    funnelStage === stage.value
                      ? "bg-ink text-paper"
                      : "text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            {funnelStage && (
              <p className="text-xs text-ink-light mt-1.5">
                {FUNNEL_STAGES.find((f) => f.value === funnelStage)?.description}
              </p>
            )}
          </div>

          {/* Content pillar selector */}
          <div>
            <label className="text-xs text-ink-muted uppercase tracking-wide block mb-2">
              Content Pillar
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONTENT_PILLARS.map((pillar) => (
                <button
                  key={pillar.value}
                  type="button"
                  onClick={() =>
                    setContentPillar(contentPillar === pillar.value ? "" : pillar.value)
                  }
                  title={pillar.description}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    contentPillar === pillar.value
                      ? pillar.colorClass
                      : "text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm"
                  }`}
                >
                  {pillar.shortLabel}
                </button>
              ))}
            </div>
            {contentPillar && (
              <p className="text-xs text-ink-light mt-1.5">
                {CONTENT_PILLARS.find((p) => p.value === contentPillar)?.description}
                <span className="ml-2 text-ink-muted">
                  ({CONTENT_PILLARS.find((p) => p.value === contentPillar)?.funnelRole})
                </span>
              </p>
            )}
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

      {/* Voice guide sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <button
          onClick={() => setShowVoice(!showVoice)}
          className="text-xs text-ink-muted uppercase tracking-wide hover:text-ink transition-colors mb-3"
        >
          {showVoice ? "Hide Voice Guide" : "Show Voice Guide"}
        </button>
        {showVoice && (
          <div className="rounded-lg border border-paper-muted p-4 space-y-4 bg-paper-warm/30 sticky top-6">
            {/* Persona principles (always present) */}
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Voice</p>
              <div className="space-y-1">
                {PERSONA_SIDEBAR_PRINCIPLES[0].entries.map((e, i) => (
                  <p key={i} className="text-xs text-ink leading-relaxed">• {e}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Banned</p>
              <div className="space-y-1">
                {PERSONA_SIDEBAR_PRINCIPLES[1].entries.map((e, i) => (
                  <p key={i} className="text-xs text-terracotta/80 leading-relaxed">✗ {e}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Style</p>
              <div className="space-y-1">
                {PERSONA_SIDEBAR_PRINCIPLES[2].entries.map((e, i) => (
                  <p key={i} className="text-xs text-ink leading-relaxed">• {e}</p>
                ))}
              </div>
            </div>

            {/* Custom voice guide entries */}
            {voiceGrouped.length > 0 && (
              <div className="border-t border-paper-muted pt-3">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Your Additions</p>
                {voiceGrouped.map((group) => (
                  <div key={group.value} className="mb-2">
                    <p className="text-xs text-ink-muted mb-1">{group.label}</p>
                    <div className="space-y-1">
                      {group.items.map((entry) => (
                        <p
                          key={entry.id}
                          className={`text-xs text-ink leading-relaxed ${
                            group.value === "dont" ? "text-terracotta/80" : ""
                          }`}
                        >
                          {group.value === "do" && "✓ "}
                          {group.value === "dont" && "✗ "}
                          {entry.content}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
