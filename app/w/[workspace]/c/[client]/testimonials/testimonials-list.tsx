"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Testimonial = {
  id: string;
  body: string;
  attributed_to: string | null;
  attribution_role: string | null;
  approved: boolean;
  private_notes: string | null;
  created_at: string;
  source_meeting_id: string | null;
};

export function TestimonialsList({
  testimonials,
  workspaceSlug,
  clientSlug,
}: {
  testimonials: Testimonial[];
  workspaceSlug: string;
  clientSlug: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function update(id: string, updates: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/ops/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not update");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/ops/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete");
      return;
    }
    router.refresh();
  }

  if (testimonials.length === 0) {
    return (
      <p className="text-sm text-ink-light">No testimonials yet.</p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {testimonials.map((t) => (
          <li
            key={t.id}
            className={`rounded-md border p-4 space-y-2 ${t.approved ? "border-moss bg-moss/5" : "border-paper-muted bg-paper-warm/60"}`}
          >
            <p className="text-sm text-ink whitespace-pre-wrap measure italic">
              &ldquo;{t.body}&rdquo;
            </p>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <div>
                <span className="text-ink">
                  {t.attributed_to || "Unattributed"}
                </span>
                {t.attribution_role && (
                  <span className="text-ink-light">
                    {" \u00b7 "}
                    {t.attribution_role}
                  </span>
                )}
                {t.source_meeting_id && (
                  <>
                    {" \u00b7 "}
                    <Link
                      href={`/w/${workspaceSlug}/c/${clientSlug}/meetings/${t.source_meeting_id}`}
                      className="text-clay hover:text-ink transition-colors"
                    >
                      source meeting
                    </Link>
                  </>
                )}
              </div>
              <span className="text-ink-light">
                {new Date(t.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => update(t.id, { approved: !t.approved })}
                className={`transition-colors ${t.approved ? "text-ink-light hover:text-ink" : "text-moss hover:text-ink"}`}
              >
                {t.approved ? "Unapprove" : "Approve"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const role = prompt("Attribution role (title, company, etc.)", t.attribution_role || "");
                  if (role !== null) update(t.id, { attribution_role: role });
                }}
                className="text-ink-light hover:text-ink transition-colors"
              >
                Edit role
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-ink-light hover:text-terracotta transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="text-terracotta text-sm mt-3">{error}</p>}
    </>
  );
}
