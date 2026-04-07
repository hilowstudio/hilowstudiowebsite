"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Contact, Activity, Booking, ContactStage } from "@/lib/types/database";

const stages: ContactStage[] = [
  "lead",
  "engaged",
  "call_booked",
  "proposal_sent",
  "won",
  "lost",
];

const stageLabels: Record<ContactStage, string> = {
  lead: "Lead",
  engaged: "Engaged",
  call_booked: "Call Booked",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/contacts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setContact(data.contact);
      setActivities(data.activities);
      setBookings(data.bookings);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStage(stage: ContactStage) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) {
      setContact(await res.json());
      load();
    }
  }

  async function updateNotes(notes: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/contacts/${id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: note }),
    });
    if (res.ok) {
      setNote("");
      load();
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-ink-light text-sm py-8">Loading...</p>;
  }

  if (!contact) {
    return <p className="text-terracotta text-sm py-8">Contact not found.</p>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <button
        onClick={() => router.push("/admin/contacts")}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Pipeline
      </button>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-ink">{contact.name}</h1>
        <p className="text-ink-muted text-sm">{contact.email}</p>
        {contact.company && (
          <p className="text-ink-light text-sm">{contact.company}</p>
        )}
      </div>

      {/* Stage selector */}
      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-2">
          Stage
        </label>
        <div className="flex gap-1 flex-wrap">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => updateStage(s)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                contact.stage === s
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:text-ink border border-paper-muted"
              }`}
            >
              {stageLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-2">
          Notes
        </label>
        <textarea
          defaultValue={contact.notes || ""}
          onBlur={(e) => updateNotes(e.target.value)}
          rows={3}
          placeholder="Private notes about this contact..."
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay resize-y"
        />
      </div>

      {/* Bookings */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            Bookings
          </h2>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border border-paper-muted p-3 text-sm"
              >
                <div>
                  <p className="text-ink">
                    {new Date(booking.start_time).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {booking.message && (
                    <p className="text-ink-light text-xs mt-1">
                      {booking.message}
                    </p>
                  )}
                </div>
                {booking.meet_link && (
                  <a
                    href={booking.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay text-xs hover:underline"
                  >
                    Meet link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add activity note */}
      <div>
        <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
          Add Note
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Log an activity or note..."
            className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay"
          />
          <button
            onClick={addNote}
            disabled={saving || !note.trim()}
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Activity timeline */}
      {activities.length > 0 && (
        <div>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            Activity
          </h2>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 text-sm">
                <span className="text-ink-light text-xs shrink-0 pt-0.5 w-16">
                  {new Date(activity.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div>
                  <span className="text-ink-muted">
                    {activity.type.replace(/_/g, " ")}
                  </span>
                  {activity.description && (
                    <p className="text-ink mt-0.5">{activity.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
