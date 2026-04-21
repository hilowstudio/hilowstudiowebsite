"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type KeyName =
  | "fireflies_api_key"
  | "fathom_api_key"
  | "anthropic_api_key"
  | "deepgram_api_key"
  | "openrouter_api_key";

const KEY_LABELS: Record<KeyName, string> = {
  fireflies_api_key: "Fireflies API key",
  fathom_api_key: "Fathom API key",
  anthropic_api_key: "Anthropic API key (BYOK override)",
  deepgram_api_key: "Deepgram API key (BYOK override)",
  openrouter_api_key: "OpenRouter API key (BYOK override)",
};

const KEY_ORDER: KeyName[] = [
  "fireflies_api_key",
  "fathom_api_key",
  "anthropic_api_key",
  "deepgram_api_key",
  "openrouter_api_key",
];

export function IntegrationsForm({
  clientId,
  existingKeys,
}: {
  clientId: string;
  existingKeys: string[];
}) {
  const router = useRouter();
  const configured = new Set(existingKeys);
  const [values, setValues] = useState<Record<KeyName, string>>({
    fireflies_api_key: "",
    fathom_api_key: "",
    anthropic_api_key: "",
    deepgram_api_key: "",
    openrouter_api_key: "",
  });
  const [savingKey, setSavingKey] = useState<KeyName | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(key: KeyName) {
    setSavingKey(key);
    setMessage("");
    setError("");
    const res = await fetch(`/api/ops/clients/${clientId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] || "" }),
    });
    if (res.ok) {
      setMessage(
        values[key]
          ? `${KEY_LABELS[key]} saved.`
          : `${KEY_LABELS[key]} cleared.`,
      );
      setValues((prev) => ({ ...prev, [key]: "" }));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not save");
    }
    setSavingKey(null);
  }

  return (
    <div className="space-y-4">
      {KEY_ORDER.map((key) => {
        const isConfigured = configured.has(key);
        return (
          <div
            key={key}
            className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink">{KEY_LABELS[key]}</span>
              <span className="text-xs text-ink-light">
                {isConfigured ? "Configured" : "Not set"}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={values[key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={isConfigured ? "Replace key..." : "Paste key..."}
                className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
              />
              <button
                type="button"
                onClick={() => save(key)}
                disabled={savingKey === key || !values[key]}
                className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
              >
                {savingKey === key ? "Saving..." : "Save"}
              </button>
              {isConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    setValues((prev) => ({ ...prev, [key]: "" }));
                    save(key);
                  }}
                  className="px-3 py-2 rounded-md text-ink-light hover:text-terracotta text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        );
      })}

      {message && <p className="text-moss text-sm">{message}</p>}
      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
