"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Contact, ContactStage } from "@/lib/types/database";

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

const stageColors: Record<ContactStage, string> = {
  lead: "bg-paper-muted text-ink-muted",
  engaged: "bg-clay-muted/20 text-clay",
  call_booked: "bg-clay/20 text-clay",
  proposal_sent: "bg-moss/20 text-moss",
  won: "bg-moss/30 text-moss",
  lost: "bg-terracotta/20 text-terracotta",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<ContactStage | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url =
        filter === "all"
          ? "/api/admin/contacts"
          : `/api/admin/contacts?stage=${filter}`;
      const res = await fetch(url);
      if (res.ok) setContacts(await res.json());
      setLoading(false);
    }
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Pipeline</h1>
        <Link
          href="/admin/contacts/new"
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          Add contact
        </Link>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            filter === "all"
              ? "bg-ink text-paper"
              : "text-ink-muted hover:text-ink hover:bg-paper-warm"
          }`}
        >
          All
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilter(stage)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === stage
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {stageLabels[stage]}
          </button>
        ))}
      </div>

      {/* Contacts table */}
      {loading ? (
        <p className="text-ink-light text-sm py-8">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-ink-light text-sm py-8">No contacts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-paper-muted">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Stage</th>
                <th className="pb-2 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/contacts/${contact.id}`}
                      className="text-ink hover:text-clay transition-colors"
                    >
                      {contact.name}
                    </Link>
                  </td>
                  <td className="py-3 text-ink-muted">{contact.email}</td>
                  <td className="py-3 text-ink-muted">
                    {contact.company || "-"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${stageColors[contact.stage]}`}
                    >
                      {stageLabels[contact.stage]}
                    </span>
                  </td>
                  <td className="py-3 text-ink-light">
                    {new Date(contact.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
