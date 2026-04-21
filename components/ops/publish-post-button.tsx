"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishPostButton({
  postId,
  status,
}: {
  postId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (status === "published") {
    return (
      <p className="text-xs text-moss">Already published to LinkedIn.</p>
    );
  }

  async function publish() {
    if (!confirm("Publish this post to LinkedIn now?")) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/content-posts/${postId}/publish`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Publish failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex items-baseline justify-end gap-3">
      {error && <span className="text-xs text-terracotta">{error}</span>}
      <button
        type="button"
        onClick={publish}
        disabled={busy}
        className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {busy ? "Publishing..." : "Publish to LinkedIn now"}
      </button>
    </div>
  );
}
