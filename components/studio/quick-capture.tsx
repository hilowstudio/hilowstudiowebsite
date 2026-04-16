"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function QuickCapture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => textareaRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
    setError("");
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/studio/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-md border border-paper-muted bg-paper shadow-lg"
      >
        <div className="px-4 pt-3 pb-2 border-b border-paper-muted flex items-baseline justify-between">
          <span className="text-xs text-ink-muted uppercase tracking-wide">
            What's on your mind?
          </span>
          <span className="text-xs text-ink-light">esc to close</span>
        </div>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={4}
          className="w-full px-4 py-3 bg-paper text-ink text-sm resize-none focus:outline-none measure"
          placeholder="Drop any thought. File or toss it later."
        />
        <div className="px-4 pt-2 pb-3 border-t border-paper-muted flex items-center justify-between">
          <span className="text-xs text-ink-light">
            {error ? (
              <span className="text-terracotta">{error}</span>
            ) : (
              "⌘↵ or enter to file"
            )}
          </span>
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            File to inbox
          </button>
        </div>
      </form>
    </div>
  );
}
