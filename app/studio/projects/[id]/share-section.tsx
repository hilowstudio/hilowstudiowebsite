"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ShareSection({
  projectId,
  slug,
  enabled,
}: {
  projectId: string;
  slug: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/p/${slug}` : `/p/${slug}`;

  async function toggle() {
    const next = !isEnabled;
    setIsEnabled(next);
    setSaving(true);
    setError("");
    const res = await fetch(`/api/studio/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_status_enabled: next }),
    });
    if (!res.ok) {
      setIsEnabled(!next);
      const data = await res.json();
      setError(data.error || "Failed to update");
    } else {
      startTransition(() => router.refresh());
    }
    setSaving(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed. Select and copy manually.");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg text-ink">Share</h2>

      <div className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={toggle}
            disabled={saving}
            className="mt-0.5"
          />
          <span className="text-sm text-ink">
            Public status page
            <span className="block text-xs text-ink-light mt-0.5">
              Shows current phase, what's done in it, and what's next. No dates,
              no money, no internal tasks.
            </span>
          </span>
        </label>

        {isEnabled && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-paper-muted">
            <code className="text-xs text-ink-muted font-mono bg-paper px-2 py-1 rounded border border-paper-muted flex-1 truncate min-w-0">
              {url}
            </code>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-clay hover:text-ink transition-colors px-2 py-1"
            >
              Open
            </a>
            <button
              type="button"
              onClick={copy}
              className="text-xs px-2 py-1 rounded bg-ink text-paper hover:bg-ink-muted transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
