"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteMeetingButton({
  meetingId,
  redirectTo,
}: {
  meetingId: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (
      !confirm(
        "Delete this meeting + its insights + any post drafts? Can't be undone.",
      )
    )
      return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/meetings/${meetingId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push(redirectTo);
    } else {
      const data = await res.json();
      setError(data.error || "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-baseline justify-end gap-3">
      {error && <span className="text-xs text-terracotta">{error}</span>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="text-xs text-ink-light hover:text-terracotta transition-colors disabled:opacity-50"
      >
        {busy ? "Deleting..." : "Delete meeting"}
      </button>
    </div>
  );
}
