"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type IntegrationKey =
  | "fireflies_api_key"
  | "fathom_api_key"
  | "anthropic_api_key"
  | "openai_api_key"
  | "gemini_api_key"
  | "xai_api_key"
  | "deepgram_api_key"
  | "openrouter_api_key";

const KEY_LABELS: Record<IntegrationKey, string> = {
  fireflies_api_key: "Fireflies API key",
  fathom_api_key: "Fathom API key",
  anthropic_api_key: "Anthropic API key (upgrades LLM calls to Claude)",
  openai_api_key: "OpenAI API key (upgrades LLM calls to GPT)",
  gemini_api_key: "Google Gemini API key (upgrades LLM calls to Gemini)",
  xai_api_key: "xAI API key (upgrades LLM calls to Grok)",
  deepgram_api_key: "Deepgram API key",
  openrouter_api_key: "OpenRouter API key",
};

export function IntegrationsForm({
  settingsUrl,
  availableKeys,
  existingKeys,
  labelOverrides,
}: {
  settingsUrl: string;
  availableKeys: IntegrationKey[];
  existingKeys: string[];
  labelOverrides?: Partial<Record<IntegrationKey, string>>;
}) {
  const router = useRouter();
  const configured = new Set(existingKeys);
  const [values, setValues] = useState<Record<IntegrationKey, string>>({
    fireflies_api_key: "",
    fathom_api_key: "",
    anthropic_api_key: "",
    openai_api_key: "",
    gemini_api_key: "",
    xai_api_key: "",
    deepgram_api_key: "",
    openrouter_api_key: "",
  });
  const [savingKey, setSavingKey] = useState<IntegrationKey | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(key: IntegrationKey) {
    setSavingKey(key);
    setMessage("");
    setError("");
    const res = await fetch(settingsUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] || "" }),
    });
    if (res.ok) {
      const label = labelOverrides?.[key] ?? KEY_LABELS[key];
      setMessage(
        values[key] ? `${label} saved.` : `${label} cleared.`,
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
      {availableKeys.map((key) => {
        const isConfigured = configured.has(key);
        const label = labelOverrides?.[key] ?? KEY_LABELS[key];
        return (
          <div
            key={key}
            className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink">{label}</span>
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
