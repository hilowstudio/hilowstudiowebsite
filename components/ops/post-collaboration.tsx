"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  body: string;
  resolved: boolean;
  created_at: string;
  user: { id: string; email: string; name: string | null } | null;
};

type Approval = {
  id: string;
  state: "requested" | "approved" | "changes_requested";
  note: string | null;
  acted_at: string;
  user: { id: string; email: string; name: string | null } | null;
};

const STATE_LABELS: Record<Approval["state"], string> = {
  requested: "Review requested",
  approved: "Approved",
  changes_requested: "Changes requested",
};

const STATE_CLASSES: Record<Approval["state"], string> = {
  requested: "bg-clay/20 text-clay",
  approved: "bg-moss/30 text-moss",
  changes_requested: "bg-terracotta/20 text-terracotta",
};

function userLabel(u: Comment["user"] | Approval["user"]): string {
  if (!u) return "Unknown";
  return u.name || u.email;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PostCollaboration({
  postId,
  canApprove = false,
}: {
  postId: string;
  canApprove?: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [commentsRes, approvalsRes] = await Promise.all([
      fetch(`/api/ops/content-posts/${postId}/comments`),
      fetch(`/api/ops/content-posts/${postId}/approvals`),
    ]);
    if (commentsRes.ok) {
      setComments((await commentsRes.json()) as Comment[]);
    }
    if (approvalsRes.ok) {
      setApprovals((await approvalsRes.json()) as Approval[]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/content-posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      await load();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not comment");
    }
    setBusy(false);
  }

  async function submitApproval(state: Approval["state"]) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/content-posts/${postId}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, note: note.trim() || null }),
    });
    if (res.ok) {
      setNote("");
      await load();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not submit approval");
    }
    setBusy(false);
  }

  const latestApproval = approvals[0];

  return (
    <div className="space-y-6">
      {latestApproval && (
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs ${STATE_CLASSES[latestApproval.state]}`}
        >
          {STATE_LABELS[latestApproval.state]} &middot;{" "}
          {userLabel(latestApproval.user)}
          {" \u00b7 "}
          {formatDate(latestApproval.acted_at)}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-serif text-lg text-ink">Comments</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-ink-light">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-3"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm text-ink">{userLabel(c.user)}</span>
                  <span className="text-xs text-ink-light">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y measure"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              Post comment
            </button>
          </div>
        </form>
      </section>

      {canApprove && (
        <section className="space-y-2">
          <h3 className="font-serif text-lg text-ink">Approval</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note with your decision..."
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submitApproval("approved")}
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-moss text-paper text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => submitApproval("changes_requested")}
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-terracotta text-paper text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Request changes
            </button>
            <button
              type="button"
              onClick={() => submitApproval("requested")}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-ink-muted hover:text-ink text-sm transition-colors"
            >
              Request a review
            </button>
          </div>
        </section>
      )}

      {approvals.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-serif text-sm text-ink-muted uppercase tracking-wide">
            Approval history
          </h3>
          <ul className="space-y-1 text-xs">
            {approvals.map((a) => (
              <li
                key={a.id}
                className="flex items-baseline gap-3 text-ink-muted"
              >
                <span
                  className={`px-2 py-0.5 rounded-full ${STATE_CLASSES[a.state]}`}
                >
                  {STATE_LABELS[a.state]}
                </span>
                <span>{userLabel(a.user)}</span>
                <span className="text-ink-light">{formatDate(a.acted_at)}</span>
                {a.note && <span className="italic">&mdash; {a.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
