"use client";

import { useEffect, useState } from "react";
import { HOOK_TYPES } from "@/lib/content-strategy";

export function HookPreferences({ workspaceId }: { workspaceId: string }) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/ops/workspaces/${workspaceId}/settings/hooks`)
      .then((r) => (r.ok ? r.json() : { enabledHooks: [] }))
      .then((json: { enabledHooks: string[] }) => {
        setEnabled(new Set(json.enabledHooks));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [workspaceId]);

  async function toggle(value: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/settings/hooks`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledHooks: Array.from(enabled) }),
      },
    );
    if (res.ok) {
      setMessage("Saved");
      setTimeout(() => setMessage(""), 2000);
    } else {
      const data = await res.json();
      setMessage(data.error || "Save failed");
    }
    setSaving(false);
  }

  if (!loaded) return <p className="text-sm text-ink-light">Loading...</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        Toggle which hook types show up in the composer. Leave all off to allow
        every hook.
      </p>
      <div className="flex gap-2 flex-wrap">
        {HOOK_TYPES.map((hook) => (
          <button
            key={hook.value}
            type="button"
            onClick={() => toggle(hook.value)}
            title={hook.description}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              enabled.has(hook.value)
                ? "bg-clay text-paper"
                : "text-ink-muted border border-paper-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {hook.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {message && <span className="text-xs text-ink-light">{message}</span>}
      </div>
    </div>
  );
}
