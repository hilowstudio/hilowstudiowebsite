"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncMeetingsButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function sync() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/ops/clients/${clientId}/meetings/sync`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ingested: number;
          skipped: number;
          failures: { external_id: string; error: string }[];
        };
        setMessage(
          `Ingested ${data.ingested}, skipped ${data.skipped}${data.failures.length ? `, ${data.failures.length} failure(s)` : ""}.`,
        );
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Sync failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex items-baseline gap-3">
      {message && <span className="text-xs text-moss">{message}</span>}
      {error && <span className="text-xs text-terracotta">{error}</span>}
      <button
        type="button"
        onClick={sync}
        disabled={busy}
        className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {busy ? "Syncing..." : "Sync Fireflies"}
      </button>
    </div>
  );
}
