"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invite = {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export function InvitesPanel({
  workspaceId,
  initialInvites,
}: {
  workspaceId: string;
  initialInvites: Invite[];
}) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "staff">("staff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      const created = (await res.json()) as {
        token: string;
        email: string;
        role: string;
        expires_at: string;
      };
      setInvites((prev) => [
        {
          id: created.token,
          email: created.email,
          role: created.role,
          token: created.token,
          expires_at: created.expires_at,
          accepted_at: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setEmail("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not create invite");
    }
    setSaving(false);
  }

  const inputClass =
    "flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <div className="space-y-4 max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@company.com"
          className={inputClass}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "owner" | "staff")}
          className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
        >
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
        <button
          type="submit"
          disabled={saving || !email.trim()}
          className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          Invite
        </button>
      </form>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      {invites.length === 0 ? (
        <p className="text-ink-light text-sm">No invites yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {invites.map((invite) => {
            const url = origin
              ? `${origin}/app/invite/${invite.token}`
              : `/app/invite/${invite.token}`;
            const accepted = Boolean(invite.accepted_at);
            const expired = new Date(invite.expires_at).getTime() < Date.now();
            return (
              <li
                key={invite.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-1"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-ink">{invite.email}</span>
                  <span className="text-xs text-ink-light">
                    {accepted
                      ? "Accepted"
                      : expired
                        ? "Expired"
                        : invite.role}
                  </span>
                </div>
                {!accepted && !expired && (
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-ink-muted font-mono bg-paper px-2 py-1 rounded border border-paper-muted flex-1 truncate min-w-0">
                      {url}
                    </code>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(url);
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-xs px-2 py-1 rounded bg-ink text-paper hover:bg-ink-muted transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
