"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Outreach = {
  id: string;
  kind: string;
  direction: string;
  subject: string | null;
  body: string | null;
  completed_at: string | null;
  scheduled_for: string | null;
  follow_up_at: string | null;
  created_at: string;
};

type Draft = {
  id: string;
  kind: string;
  draft_body: string;
  status: string;
  generated_at: string;
};

const KIND_LABELS: Record<string, string> = {
  sent_dm: "Sent DM",
  sent_inmail: "Sent InMail",
  sent_email: "Sent email",
  received_reply: "Received reply",
  event_met: "Met at event",
  engaged_on_their_post: "Engaged on their post",
  commented_on_their_post: "Commented on their post",
  phone_call: "Phone call",
  note: "Note",
  other: "Other",
};

const KIND_OPTIONS = Object.keys(KIND_LABELS);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OutreachTimeline({
  leadId,
  outreach,
  drafts,
}: {
  leadId: string;
  outreach: Outreach[];
  drafts: Draft[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState("sent_dm");
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [draftKind, setDraftKind] = useState<"dm" | "inmail" | "email">("dm");
  const [draftAngle, setDraftAngle] = useState("");
  const [drafting, setDrafting] = useState(false);

  async function logTouch(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/leads/${leadId}/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        direction,
        subject: subject.trim() || null,
        body: body.trim() || null,
        follow_up_at: followUp
          ? new Date(followUp).toISOString()
          : null,
      }),
    });
    if (res.ok) {
      setSubject("");
      setBody("");
      setFollowUp("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Log failed");
    }
    setSaving(false);
  }

  async function draftOutreach() {
    if (!draftAngle.trim()) return;
    setDrafting(true);
    setError("");
    const res = await fetch(`/api/ops/leads/${leadId}/draft-outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: draftKind, angle: draftAngle.trim() }),
    });
    if (res.ok) {
      setDraftAngle("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Draft failed");
    }
    setDrafting(false);
  }

  async function sendDraft(draft: Draft) {
    const res = await fetch(`/api/ops/leads/${leadId}/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind:
          draft.kind === "dm"
            ? "sent_dm"
            : draft.kind === "inmail"
              ? "sent_inmail"
              : "sent_email",
        direction: "outbound",
        body: draft.draft_body,
      }),
    });
    if (res.ok) {
      await fetch(`/api/ops/outreach-drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      router.refresh();
    }
  }

  async function dismissDraft(id: string) {
    await fetch(`/api/ops/outreach-drafts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    router.refresh();
  }

  const inputClass =
    "px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-md border border-paper-muted bg-paper-warm/60 p-4">
        <h2 className="font-serif text-lg text-ink">Draft outreach with AI</h2>
        <p className="text-xs text-ink-muted measure">
          Give me the angle. I&apos;ll draft the message in your voice. Send it
          from your own LinkedIn or email.
        </p>
        <div className="flex gap-2 flex-wrap">
          <select
            value={draftKind}
            onChange={(e) =>
              setDraftKind(e.target.value as "dm" | "inmail" | "email")
            }
            className={inputClass}
          >
            <option value="dm">LinkedIn DM</option>
            <option value="inmail">LinkedIn InMail</option>
            <option value="email">Email</option>
          </select>
          <input
            type="text"
            value={draftAngle}
            onChange={(e) => setDraftAngle(e.target.value)}
            placeholder="e.g. noticed you just raised; congrats + ask about fractional ops"
            className={`${inputClass} flex-1 min-w-[240px]`}
          />
          <button
            type="button"
            onClick={draftOutreach}
            disabled={drafting || !draftAngle.trim()}
            className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {drafting ? "Drafting..." : "Draft"}
          </button>
        </div>
      </section>

      {drafts.filter((d) => d.status === "draft").length > 0 && (
        <section className="space-y-2">
          <h2 className="font-serif text-lg text-ink">Pending drafts</h2>
          {drafts
            .filter((d) => d.status === "draft")
            .map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-clay bg-paper-warm/60 p-3 space-y-2"
              >
                <p className="text-xs text-ink-muted uppercase tracking-wide">
                  {d.kind.toUpperCase()} draft ·{" "}
                  {new Date(d.generated_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {d.draft_body}
                </p>
                <div className="flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(d.draft_body);
                      } catch {
                        // no-op
                      }
                    }}
                    className="px-2 py-1 rounded text-ink-muted hover:text-ink transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => sendDraft(d)}
                    className="px-2 py-1 rounded bg-ink text-paper hover:bg-ink-muted transition-colors"
                  >
                    Mark as sent
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissDraft(d.id)}
                    className="px-2 py-1 rounded text-ink-light hover:text-terracotta transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
        </section>
      )}

      <section className="space-y-3 rounded-md border border-paper-muted bg-paper-warm/30 p-4">
        <h2 className="font-serif text-lg text-ink">Log a touch</h2>
        <form onSubmit={logTouch} className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className={inputClass}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as "outbound" | "inbound")
              }
              className={inputClass}
            >
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject / what you said (optional)"
            className={`${inputClass} w-full`}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Full message or note (optional)"
            rows={3}
            className={`${inputClass} w-full resize-y`}
          />
          <div className="flex gap-2 flex-wrap items-center">
            <label className="text-xs text-ink-muted">Follow up:</label>
            <input
              type="datetime-local"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className={inputClass}
            />
            <div className="flex-1" />
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {saving ? "Logging..." : "Log touch"}
            </button>
          </div>
        </form>
        {error && <p className="text-terracotta text-sm">{error}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Timeline</h2>
        {outreach.length === 0 ? (
          <p className="text-sm text-ink-light">No touches yet.</p>
        ) : (
          <ul className="space-y-2">
            {outreach.map((o) => (
              <li
                key={o.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-1"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-ink">
                      {KIND_LABELS[o.kind] ?? o.kind}
                    </span>
                    <span className="text-xs text-ink-light capitalize">
                      {o.direction}
                    </span>
                  </div>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {formatDate(o.completed_at ?? o.created_at)}
                  </span>
                </div>
                {o.subject && (
                  <p className="text-sm text-ink font-medium">{o.subject}</p>
                )}
                {o.body && (
                  <p className="text-sm text-ink whitespace-pre-wrap measure">
                    {o.body}
                  </p>
                )}
                {o.follow_up_at && (
                  <p className="text-xs text-clay">
                    Follow up by{" "}
                    {new Date(o.follow_up_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
