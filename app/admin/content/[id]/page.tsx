"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ContentPost, PostType, HookType, FunnelStage, ContentPillar } from "@/lib/types/database";
import { HOOK_TYPES, FUNNEL_STAGES, CONTENT_PILLARS } from "@/lib/content-strategy";
import { checkVoiceViolations } from "@/lib/voice-persona";
import { LinkedInPreview } from "@/components/linkedin-preview";
import { ProcessingBanner } from "@/components/processing-banner";

const postTypes: { value: PostType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "carousel", label: "Carousel" },
  { value: "poll", label: "Poll" },
  { value: "article", label: "Article" },
];

function PdfPreview({
  base64,
  label,
  filename,
  height,
}: {
  base64: string;
  label: string;
  filename: string;
  height: number;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [base64]);

  if (!blobUrl) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">{label}</p>
        <a
          href={blobUrl}
          download={filename}
          className="px-3 py-1 rounded-md bg-moss/15 text-moss text-xs hover:bg-moss/25 transition-colors"
        >
          Download
        </a>
      </div>
      <iframe
        src={blobUrl}
        className="w-full rounded-lg border border-paper-muted bg-white"
        style={{ height }}
        title={`${label} Preview`}
      />
    </div>
  );
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ContentPost | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [scheduledAt, setScheduledAt] = useState("");
  const [hookType, setHookType] = useState<HookType | "">("");
  const [funnelStage, setFunnelStage] = useState<FunnelStage | "">("");
  const [contentPillar, setContentPillar] = useState<ContentPillar | "">("");
  const [firstComment, setFirstComment] = useState("");
  const [firstCommentDelay, setFirstCommentDelay] = useState(2);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingCarousel, setGeneratingCarousel] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<string[]>([]); // descriptive labels
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);


  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/content/${id}`);
      if (res.ok) {
        const data: ContentPost = await res.json();
        setPost(data);
        setTitle(data.title || "");
        setBody(data.body);
        setPostType(data.post_type);
        setHookType(data.hook_type || "");
        setFunnelStage(data.funnel_stage || "");
        setContentPillar(data.content_pillar || "");
        setFirstComment(data.first_comment || "");
        setFirstCommentDelay(data.first_comment_delay_minutes || 2);
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


  // Poll for background job results when jobs are pending
  const refreshPost = useCallback(async () => {
    const res = await fetch(`/api/admin/content/${id}`);
    if (res.ok) {
      const data: ContentPost = await res.json();
      setPost(data);
    }
  }, [id]);

  useEffect(() => {
    if (pendingJobs.length > 0) {
      pollRef.current = setInterval(async () => {
        await refreshPost();
      }, 5000); // Poll every 5 seconds
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingJobs, refreshPost]);

  // Auto-clear pending jobs when their results appear
  useEffect(() => {
    if (!post) return;
    setPendingJobs((prev) => {
      const next = prev.filter((job) => {
        if (job === "carousel" && post.metadata?.carousel_pdf) return false;
        if (job === "quote_card" && post.metadata?.post_image) return false;
        return true;
      });
      return next.length === prev.length ? prev : next;
    });
  }, [post]);

  async function handleSave(status?: string) {
    setSaving(true);
    setError("");

    const updates: Record<string, unknown> = {
      title: title || null,
      body,
      post_type: postType,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      hook_type: hookType || null,
      funnel_stage: funnelStage || null,
      content_pillar: contentPillar || null,
      first_comment: firstComment || null,
      first_comment_delay_minutes: firstCommentDelay,
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

  async function handlePublishNow() {
    if (!confirm("Publish this post to LinkedIn right now?")) return;
    setPublishing(true);
    setError("");

    // Save any pending edits first so we publish what the user sees on screen
    const saveRes = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || null,
        body,
        post_type: postType,
        hook_type: hookType || null,
        funnel_stage: funnelStage || null,
        content_pillar: contentPillar || null,
        first_comment: firstComment || null,
        first_comment_delay_minutes: firstCommentDelay,
      }),
    });

    if (!saveRes.ok) {
      const data = await saveRes.json();
      setError(data.error || "Failed to save before publishing");
      setPublishing(false);
      return;
    }

    const res = await fetch(`/api/admin/content/${id}/publish-now`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to publish");
      // Reload so the user sees the updated status (likely "failed")
      const reload = await fetch(`/api/admin/content/${id}`);
      if (reload.ok) setPost(await reload.json());
      setPublishing(false);
      return;
    }

    setPost(data);
    setPublishing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
    router.push("/admin/content");
  }

  // Hooks must run on every render — keep above any early returns.
  const violations = useMemo(() => checkVoiceViolations(body), [body]);

  if (loading) return <p className="text-ink-light text-sm py-8">Loading...</p>;
  if (!post) return <p className="text-terracotta text-sm py-8">Post not found.</p>;

  const isEditable = post.status === "draft" || post.status === "scheduled" || post.status === "failed";

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
            <p className="text-xs text-ink-light mt-1">
              {body.length} characters
              {body.length > 0 && body.length < 900 && ". Aim for 900-1,500 for best reach"}
              {body.length >= 900 && body.length <= 1500 && ". Sweet spot"}
              {body.length > 1500 && ". Consider trimming"}
            </p>
            {isEditable && violations.length > 0 && (
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

          {/* LinkedIn Preview */}
          {isEditable && (
            <div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-ink-muted uppercase tracking-wide hover:text-ink transition-colors"
              >
                {showPreview ? "Hide LinkedIn Preview" : "Show LinkedIn Preview"}
              </button>
              {showPreview && (
                <div className="mt-2">
                  <LinkedInPreview body={body} />
                </div>
              )}
            </div>
          )}

          {/* First Comment */}
          {isEditable && (
            <div className="rounded-lg border border-paper-muted p-4 space-y-3">
              <label className="text-xs text-ink-muted uppercase tracking-wide block">
                First Comment (auto-posted after publishing)
              </label>
              <textarea
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                rows={3}
                placeholder="Add a link or CTA here. LinkedIn penalizes links in the main body, so put them in the first comment instead."
                className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y"
              />
              {firstComment && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-ink-muted">Post after</label>
                  <select
                    value={firstCommentDelay}
                    onChange={(e) => setFirstCommentDelay(Number(e.target.value))}
                    className="px-2 py-1 rounded-md border border-paper-muted bg-paper-warm text-ink text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((m) => (
                      <option key={m} value={m}>
                        {m} min{m > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Visual Asset (Quote Card or Carousel) */}
          {isEditable && body.trim() && (
            <div className="rounded-lg border border-paper-muted p-4 space-y-3">
              <label className="text-xs text-ink-muted uppercase tracking-wide block">
                Visual Asset
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    setGeneratingImage(true);
                    setError("");
                    const res = await fetch("/api/admin/content/image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ postId: id, type: "quote_card" }),
                    });
                    if (res.ok) {
                      setPendingJobs((prev) => [...prev, "quote_card"]);
                    } else {
                      const data = await res.json();
                      setError(data.error || "Quote card generation failed");
                    }
                    setGeneratingImage(false);
                  }}
                  disabled={generatingImage || generatingCarousel}
                  className="px-3 py-1.5 rounded-md border border-clay text-clay text-xs hover:bg-clay hover:text-paper transition-colors disabled:opacity-50"
                >
                  {generatingImage ? "Generating..." : "Quote Card"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setGeneratingCarousel(true);
                    setError("");
                    try {
                      await fetch(`/api/admin/content/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ body, title: title || null }),
                      });
                      const res = await fetch("/api/admin/content/carousel", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ postId: id }),
                      });
                      if (res.ok) {
                        setError("");
                        setPendingJobs((prev) => [...prev, "carousel"]);
                      } else {
                        const data = await res.json();
                        setError(data.error || "Carousel generation failed");
                      }
                    } catch {
                      setError("Carousel generation failed");
                    }
                    setGeneratingCarousel(false);
                  }}
                  disabled={generatingCarousel || generatingImage}
                  className="px-3 py-1.5 rounded-md border border-clay text-clay text-xs hover:bg-clay hover:text-paper transition-colors disabled:opacity-50"
                >
                  {generatingCarousel ? "Generating..." : "Carousel PDF"}
                </button>
              </div>

              {/* Processing banners */}
              {pendingJobs.includes("quote_card") && (
                <ProcessingBanner
                  message="Generating quote card..."
                  submessage="Extracting the strongest line from your post and rendering it on brand."
                />
              )}
              {pendingJobs.includes("carousel") && (
                <ProcessingBanner
                  message="Generating carousel PDF..."
                  submessage="AI is structuring your post into slides and rendering a branded PDF."
                />
              )}

              {/* Quote card result */}
              {typeof post.metadata?.post_image === "string" && (
                <PdfPreview
                  base64={post.metadata.post_image as string}
                  label="Quote Card"
                  filename="quote-card.pdf"
                  height={400}
                />
              )}

              {/* Carousel result */}
              {typeof post.metadata?.carousel_pdf === "string" && (
                <PdfPreview
                  base64={post.metadata.carousel_pdf as string}
                  label="Carousel PDF"
                  filename={`${post.title || "carousel"}.pdf`}
                  height={500}
                />
              )}
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
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
                  disabled={!isEditable}
                  onClick={() =>
                    setHookType(hookType === hook.value ? "" : hook.value)
                  }
                  title={hook.description}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-60 ${
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
                  disabled={!isEditable}
                  onClick={() =>
                    setFunnelStage(funnelStage === stage.value ? "" : stage.value)
                  }
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-60 ${
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
                  disabled={!isEditable}
                  onClick={() =>
                    setContentPillar(contentPillar === pillar.value ? "" : pillar.value)
                  }
                  title={pillar.description}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-60 ${
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

          {isEditable && (
            <div className="flex gap-3 pt-2 flex-wrap">
              <button
                onClick={() => handleSave()}
                disabled={saving || publishing}
                className="px-4 py-2 rounded-md border border-paper-muted text-ink text-sm hover:bg-paper-warm transition-colors disabled:opacity-50"
              >
                Save
              </button>
              {(post.status === "draft" || post.status === "failed") && (
                <button
                  onClick={() => handleSave("scheduled")}
                  disabled={saving || publishing || !scheduledAt}
                  className="px-4 py-2 rounded-md border border-ink text-ink text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                >
                  Schedule
                </button>
              )}
              <button
                onClick={handlePublishNow}
                disabled={saving || publishing || !body.trim()}
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "Post now"}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving || publishing}
                className="px-4 py-2 rounded-md text-terracotta text-sm hover:bg-terracotta/10 transition-colors ml-auto disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
