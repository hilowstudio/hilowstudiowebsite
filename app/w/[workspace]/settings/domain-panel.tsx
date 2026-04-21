"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Verification = { type: string; domain: string; value: string; reason: string };

type Status = {
  domain: string | null;
  verified_at: string | null;
  status: {
    name: string;
    verified: boolean;
    verification?: Verification[];
    error?: { code: string; message: string };
  } | null;
  error?: string;
};

export function DomainPanel({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [state, setState] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/domain`);
    if (res.ok) setState((await res.json()) as Status);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: input.trim() }),
    });
    if (res.ok) {
      setInput("");
      await load();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Add failed");
    }
    setSaving(false);
  }

  async function verify() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/domain`, {
      method: "PUT",
    });
    if (res.ok) {
      await load();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Verify failed");
    }
    setSaving(false);
  }

  async function remove() {
    if (!confirm("Remove this custom domain?")) return;
    setSaving(true);
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/domain`, {
      method: "DELETE",
    });
    if (res.ok) {
      await load();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Remove failed");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-ink-light">Checking domain status...</p>;
  }

  if (!state?.domain) {
    return (
      <form onSubmit={addDomain} className="space-y-3 max-w-lg">
        <div>
          <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
            Custom domain
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ops.yourcompany.com"
            className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
          />
          <p className="text-xs text-ink-light mt-2 measure">
            After adding, Vercel returns DNS records. Point them at Vercel, then
            come back and click Verify. Requires `VERCEL_API_TOKEN` and
            `VERCEL_PROJECT_ID` env vars on the platform.
          </p>
        </div>
        {error && <p className="text-terracotta text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving || !input.trim()}
          className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add domain"}
        </button>
      </form>
    );
  }

  const verified = state.verified_at || state.status?.verified;
  const verifications = state.status?.verification ?? [];

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-baseline justify-between rounded-md border border-paper-muted bg-paper-warm/60 p-3">
        <div>
          <p className="font-mono text-sm text-ink">{state.domain}</p>
          <p className="text-xs text-ink-light">
            {verified ? (
              <span className="text-moss">Verified</span>
            ) : (
              <span className="text-terracotta">Not yet verified</span>
            )}
            {state.verified_at && (
              <span className="ml-2">
                {new Date(state.verified_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!verified && (
            <button
              type="button"
              onClick={verify}
              disabled={saving}
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {saving ? "Verifying..." : "Verify"}
            </button>
          )}
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="px-3 py-1.5 rounded-md text-sm text-ink-light hover:text-terracotta transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {!verified && verifications.length > 0 && (
        <div className="rounded-md border border-paper-muted bg-paper-warm/40 p-3 text-xs space-y-2">
          <p className="text-ink-muted">
            Add these DNS records at your registrar, then click Verify.
          </p>
          <ul className="space-y-1 font-mono">
            {verifications.map((v, i) => (
              <li key={i} className="text-ink-muted">
                <span className="text-ink">{v.type}</span> {v.domain} →{" "}
                <span className="text-clay">{v.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.error && (
        <p className="text-xs text-terracotta">{state.error}</p>
      )}
      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
