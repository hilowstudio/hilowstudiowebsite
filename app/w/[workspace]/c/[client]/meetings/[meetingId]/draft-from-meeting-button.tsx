"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DraftFromMeetingButton({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function draft() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/meetings/${meetingId}/draft-post`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Draft failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex items-baseline gap-3">
      {error && <span className="text-xs text-terracotta">{error}</span>}
      <button
        type="button"
        onClick={draft}
        disabled={busy}
        className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {busy ? "Drafting..." : "Draft LinkedIn post"}
      </button>
    </div>
  );
}
