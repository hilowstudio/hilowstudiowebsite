"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncEngagementButton({
  postId,
  disabled,
}: {
  postId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (disabled) return null;

  async function sync() {
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch(
      `/api/ops/content-posts/${postId}/sync-engagement`,
      { method: "POST" },
    );
    if (res.ok) {
      const data = (await res.json()) as { likes: number; comments: number };
      setMessage(`Synced: ${data.likes} likes, ${data.comments} comments.`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Sync failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex items-baseline justify-end gap-3">
      {error && <span className="text-xs text-terracotta">{error}</span>}
      {message && <span className="text-xs text-moss">{message}</span>}
      <button
        type="button"
        onClick={sync}
        disabled={busy}
        className="text-xs text-ink-light hover:text-ink transition-colors"
      >
        {busy ? "Syncing..." : "Sync LinkedIn engagement"}
      </button>
    </div>
  );
}
