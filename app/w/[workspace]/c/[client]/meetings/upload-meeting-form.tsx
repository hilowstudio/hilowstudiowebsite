"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadMeetingForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMessage("");
    setError("");

    const body = new FormData();
    body.append("file", file);
    if (title) body.append("title", title);
    if (startedAt) body.append("started_at", new Date(startedAt).toISOString());

    const res = await fetch(`/api/ops/clients/${clientId}/meetings/upload`, {
      method: "POST",
      body,
    });

    if (res.ok) {
      setMessage("Uploaded. Transcript + insights will appear in a moment.");
      setFile(null);
      setTitle("");
      setStartedAt("");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Upload failed");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-clay hover:text-ink transition-colors"
      >
        + Upload audio file
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-3 max-w-xl"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-muted uppercase tracking-wide">
          Upload meeting audio
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-light hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
        className="w-full text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <input
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          className="px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
      {message && <p className="text-moss text-sm">{message}</p>}

      <button
        type="submit"
        disabled={busy || !file}
        className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {busy ? "Uploading + transcribing..." : "Upload + transcribe"}
      </button>
    </form>
  );
}
