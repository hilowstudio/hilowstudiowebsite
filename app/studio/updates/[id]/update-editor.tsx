"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientUpdate } from "@/lib/studio/queries";
import { checkVoiceViolations } from "@/lib/voice-persona";

const STATUS_OPTIONS: ClientUpdate["status"][] = ["draft", "approved", "sent"];
const STATUS_LABELS: Record<ClientUpdate["status"], string> = {
  draft: "Draft",
  approved: "Approved",
  sent: "Sent",
};

export function UpdateEditor({ update }: { update: ClientUpdate }) {
  const router = useRouter();
  const [body, setBody] = useState(update.final_body ?? update.draft_body);
  const [status, setStatus] = useState<ClientUpdate["status"]>(update.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const violations = checkVoiceViolations(body);
  const hasDraftChanges = body !== (update.final_body ?? update.draft_body);

  async function save(
    nextStatus: ClientUpdate["status"] = status,
    explicit = false,
  ) {
    setSaving(true);
    setError("");
    setSaved(false);
    const payload: Record<string, unknown> = { final_body: body };
    if (explicit || nextStatus !== update.status) {
      payload.status = nextStatus;
    }
    const res = await fetch(`/api/studio/updates/${update.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatus(nextStatus);
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this update?")) return;
    const res = await fetch(`/api/studio/updates/${update.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/studio/updates");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete");
    }
  }

  async function revertToDraft() {
    if (!confirm("Restore the original AI draft? Your edits will be lost.")) return;
    setBody(update.draft_body);
    setSaved(false);
  }

  return (
    <div className="space-y-4">
      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setSaved(false);
        }}
        rows={16}
        className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm text-ink text-base focus:outline-none focus:ring-2 focus:ring-clay resize-y measure font-serif"
      />

      {violations.length > 0 && (
        <div className="rounded-md border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
          Voice check: {violations.join(", ")}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 text-xs">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => save(s, true)}
              disabled={saving}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                status === s
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:text-ink hover:bg-paper-warm"
              } disabled:opacity-60`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={copyToClipboard}
          className="px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={revertToDraft}
          disabled={!hasDraftChanges && (update.final_body ?? update.draft_body) === update.draft_body}
          className="px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors disabled:opacity-40"
        >
          Revert to AI draft
        </button>
        <button
          type="button"
          onClick={() => save()}
          disabled={saving}
          className="px-4 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-paper-muted">
        {saved ? (
          <span className="text-moss text-sm">Saved.</span>
        ) : error ? (
          <span className="text-terracotta text-sm">{error}</span>
        ) : (
          <span className="text-xs text-ink-light">
            {update.sent_at
              ? `Marked sent ${new Date(update.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : ""}
          </span>
        )}
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-ink-light hover:text-terracotta transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
