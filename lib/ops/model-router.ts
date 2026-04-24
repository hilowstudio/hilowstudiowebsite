/**
 * Routes every LLM call in hi-low to a provider + model based on:
 *   1. Scope (client → workspace → platform) for BYOK resolution
 *   2. Tier (fast | standard | strong | frontier) for quality/cost trade-off
 *
 * Default path is OPEN-SOURCE ONLY. BYOK is the only way to reach frontier
 * brands (Claude, GPT, Gemini, Grok) — we never auto-route to them through
 * OpenRouter even when they're technically on the OpenRouter allow-list.
 *
 * BYOK precedence: anthropic > openai > gemini > xai. First key found in the
 * cascade (client → workspace → platform) wins and every call in that scope
 * routes through the corresponding frontier provider.
 *
 * Emergency rollback: LLM_FORCE_ANTHROPIC=1 forces all calls through
 * process.env.ANTHROPIC_API_KEY (bypassing OpenRouter).
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { resolveSetting } from "@/lib/ops/settings";

export type LLMTier = "fast" | "standard" | "strong" | "frontier";

export type LLMProvider =
  | "anthropic"
  | "openai"
  | "google"
  | "xai"
  | "openrouter";

export type ResolvedLLM = {
  provider: LLMProvider;
  model: LanguageModel;
  modelId: string;
  apiKey: string;
  /** True when the key came from a workspace or client scope (not platform/env). */
  byok: boolean;
};

/**
 * Tier → model-id map per provider. Every id here is env-overridable via
 * LLM_TIER_{TIER}_{PROVIDER}.
 *
 * OpenRouter tier map is OPEN-SOURCE ONLY. Even though Claude Opus 4.7,
 * GPT-5.4 Pro, and Grok 4.20 are on the OpenRouter allow-list, we never auto-
 * route to them — the only path to those is BYOK via the matching provider.
 *
 * Documented OpenRouter alternates (use via env override if the primary is
 * misbehaving; all open-source, all on the allow-list):
 *   fast     → google/gemma-4-26b-a4b-it or google/gemma-4-31b-it (Apache-2.0,
 *              native multimodal, edge-deployable). Note the `-it`
 *              instruction-tuned suffix is part of the canonical slug.
 *              `:free` variants also exist on the allow-list.
 *   standard → minimax/minimax-m2.7 (the only non-GLM open-source pick here)
 *   strong   → minimax/minimax-m2.7, z-ai/glm-5.1
 *   frontier → minimax/minimax-m2.7
 */
const DEFAULT_MODELS: Record<LLMProvider, Record<LLMTier, string>> = {
  anthropic: {
    fast: "claude-haiku-4-5",
    standard: "claude-sonnet-4-6",
    strong: "claude-sonnet-4-6",
    frontier: "claude-opus-4-7",
  },
  openai: {
    fast: "gpt-5.4-nano",
    standard: "gpt-5.4",
    strong: "gpt-5.4",
    frontier: "gpt-5.4-pro",
  },
  google: {
    fast: "gemini-3.1-flash-lite-preview",
    standard: "gemini-3.1-pro-preview",
    strong: "gemini-3.1-pro-preview",
    frontier: "gemini-3.1-pro-preview",
  },
  xai: {
    fast: "grok-4.20",
    standard: "grok-4.20",
    strong: "grok-4.20",
    frontier: "grok-4.20",
  },
  openrouter: {
    fast: "qwen/qwen3.6-plus",
    standard: "z-ai/glm-5.1",
    strong: "moonshotai/kimi-k2.6",
    frontier: "moonshotai/kimi-k2.6",
  },
};

function envOverride(provider: LLMProvider, tier: LLMTier): string | null {
  const key = `LLM_TIER_${tier.toUpperCase()}_${provider.toUpperCase()}`;
  return process.env[key] || null;
}

function modelIdFor(provider: LLMProvider, tier: LLMTier): string {
  return envOverride(provider, tier) ?? DEFAULT_MODELS[provider][tier];
}

export type LLMScope = {
  workspaceId?: string | null;
  clientId?: string | null;
};

async function pickProviderAndKey(
  scope: LLMScope,
): Promise<{ provider: LLMProvider; apiKey: string; byok: boolean }> {
  if (process.env.LLM_FORCE_ANTHROPIC === "1") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "LLM_FORCE_ANTHROPIC=1 but ANTHROPIC_API_KEY not set",
      );
    }
    return { provider: "anthropic", apiKey, byok: false };
  }

  // BYOK precedence: Anthropic > OpenAI > Google > xAI
  const anthropic = await resolveSetting("anthropic_api_key", scope);
  if (anthropic && (anthropic.source === "workspace" || anthropic.source === "client")) {
    return { provider: "anthropic", apiKey: anthropic.value, byok: true };
  }
  const openai = await resolveSetting("openai_api_key", scope);
  if (openai && (openai.source === "workspace" || openai.source === "client")) {
    return { provider: "openai", apiKey: openai.value, byok: true };
  }
  const gemini = await resolveSetting("gemini_api_key", scope);
  if (gemini && (gemini.source === "workspace" || gemini.source === "client")) {
    return { provider: "google", apiKey: gemini.value, byok: true };
  }
  const xai = await resolveSetting("xai_api_key", scope);
  if (xai && (xai.source === "workspace" || xai.source === "client")) {
    return { provider: "xai", apiKey: xai.value, byok: true };
  }

  // Platform default: OpenRouter → open-source only
  const openrouter = await resolveSetting("openrouter_api_key", scope);
  if (openrouter) {
    return { provider: "openrouter", apiKey: openrouter.value, byok: false };
  }

  // Env-platform Anthropic fallback if operator forgot to set OPENROUTER_API_KEY
  if (anthropic) {
    return { provider: "anthropic", apiKey: anthropic.value, byok: false };
  }

  throw new Error(
    "No LLM provider key available. Set OPENROUTER_API_KEY on the platform (or ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY / XAI_API_KEY).",
  );
}

export async function resolveLLMProvider(
  scope: LLMScope,
  tier: LLMTier,
): Promise<ResolvedLLM> {
  const { provider, apiKey, byok } = await pickProviderAndKey(scope);
  const modelId = modelIdFor(provider, tier);

  let model: LanguageModel;
  switch (provider) {
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(modelId);
      break;
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      model = openai(modelId);
      break;
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google(modelId);
      break;
    }
    case "xai": {
      const xai = createXai({ apiKey });
      model = xai(modelId);
      break;
    }
    case "openrouter": {
      // Kimi K2.6, GLM 5.1, Qwen3.6 Plus, and other regional open-source
      // endpoints on OpenRouter have inconsistent support for the
      // `response_format` parameter. OpenRouter's endpoint filter returns a
      // misleading "guardrail restrictions and data policy" 404 when no
      // endpoint for the requested model supports the feature in the payload.
      //
      // We therefore construct OpenRouter chat models cleanly — no extraBody,
      // no provider.data_collection, no response_format. Structured-output
      // callers (opsGenerateObject) must inject schema guidance via the
      // system prompt and validate the text response client-side with Zod.
      const openrouter = createOpenRouter({
        apiKey,
        fetch: process.env.LLM_DEBUG_REQUEST === "1" ? debugFetch : undefined,
      });
      model = openrouter.chat(modelId);
      break;
    }
  }

  return { provider, model, modelId, apiKey, byok };
}

/**
 * Debug fetch wrapper that logs the exact outbound request + response for
 * OpenRouter calls. Activate by setting LLM_DEBUG_REQUEST=1 in env.
 */
const debugFetch: typeof fetch = async (input, init) => {
  const url = typeof input === "string" ? input : (input as Request).url;
  const bodyStr =
    typeof init?.body === "string"
      ? init.body
      : init?.body instanceof Uint8Array
        ? new TextDecoder().decode(init.body)
        : "(non-string body)";
  console.log(`[llm:request] url=${url}\n[llm:request] body=${bodyStr}`);
  const res = await fetch(input, init);
  const clone = res.clone();
  const respText = await clone.text();
  console.log(`[llm:response] status=${res.status}\n[llm:response] body=${respText.slice(0, 2000)}`);
  return res;
};

/** For callers who need a fallback model id in the same tier after an OpenRouter 5xx. */
export function openRouterFallbackModel(tier: LLMTier): string {
  const primary = modelIdFor("openrouter", tier);
  const fallbacks: Record<LLMTier, string[]> = {
    fast: [
      "qwen/qwen3.6-plus",
      "google/gemma-4-26b-a4b-it",
      "google/gemma-4-31b-it",
    ],
    standard: ["z-ai/glm-5.1", "minimax/minimax-m2.7"],
    strong: [
      "moonshotai/kimi-k2.6",
      "minimax/minimax-m2.7",
      "z-ai/glm-5.1",
    ],
    frontier: ["moonshotai/kimi-k2.6", "minimax/minimax-m2.7"],
  };
  const alt = fallbacks[tier].find((id) => id !== primary);
  return alt ?? primary;
}
