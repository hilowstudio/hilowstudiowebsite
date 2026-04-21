"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptInviteForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/ops/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, name: name.trim() || null }),
    });
    if (res.ok) {
      router.push("/app");
    } else {
      const data = await res.json();
      setError(data.error || "Could not accept invite");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm/50 text-ink-muted text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
          Set a password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={10}
          placeholder="At least 10 characters"
          className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay text-sm"
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full px-4 py-3 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {loading ? "Accepting..." : "Accept invite"}
      </button>
    </form>
  );
}
