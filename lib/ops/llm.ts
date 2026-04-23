/**
 * Single entry point for every LLM call in hi-low.
 *
 * Replaces the old Anthropic-only `opsCreateMessage`. Routes through the
 * Vercel AI SDK (`generateText` / `generateObject`) to Anthropic, OpenAI,
 * Google, or OpenRouter based on scope + tier. BYOK in ops_settings upgrades
 * a scope to the matching frontier provider.
 */

import {
  generateText,
  generateObject,
  NoObjectGeneratedError,
  APICallError,
  type ModelMessage,
  type ToolSet,
  type GenerateTextResult,
  type GenerateObjectResult,
} from "ai";
import type { ZodType } from "zod";

import {
  resolveLLMProvider,
  openRouterFallbackModel,
  type LLMScope,
  type LLMTier,
  type ResolvedLLM,
} from "@/lib/ops/model-router";
import {
  assertCapOrBYOK,
  incrementUsage,
  QuotaExceededError,
} from "@/lib/ops/meters";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export { QuotaExceededError };
export type { LLMScope, LLMTier };

export type OpsGenerateOptions<S = unknown> = {
  scope: LLMScope;
  tier: LLMTier;
  system?: string;
  messages: ModelMessage[];
  tools?: ToolSet;
  /** When provided, routes through `generateObject` with structured output. */
  schema?: ZodType<S>;
  maxTokens?: number;
  temperature?: number;
  /**
   * Forward Anthropic's extended thinking. Honored only when the resolved
   * provider is `anthropic`; ignored otherwise (open-source models don't
   * support it).
   */
  thinking?:
    | { type: "adaptive"; display?: "omitted" | "summarized" }
    | { type: "enabled"; budgetTokens?: number };
};

export type OpsGenerateTextResult = {
  text: string;
  provider: ResolvedLLM["provider"];
  modelId: string;
  usage: GenerateTextResult<ToolSet, never>["usage"];
  tokens: number;
  toolCalls: GenerateTextResult<ToolSet, never>["toolCalls"];
  content: GenerateTextResult<ToolSet, never>["content"];
};

export type OpsGenerateObjectResult<S> = {
  object: S;
  provider: ResolvedLLM["provider"];
  modelId: string;
  usage: GenerateObjectResult<S>["usage"];
  tokens: number;
};

type ProviderOptions = Parameters<typeof generateText>[0]["providerOptions"];

function providerOptionsFor(
  provider: ResolvedLLM["provider"],
  opts: OpsGenerateOptions,
): ProviderOptions {
  if (provider === "anthropic" && opts.thinking) {
    return { anthropic: { thinking: opts.thinking } } as ProviderOptions;
  }
  return undefined;
}

function totalTokens(usage: { inputTokens?: number; outputTokens?: number }): number {
  return (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
}

async function meterIfApplicable(
  scope: LLMScope,
  byok: boolean,
  tokens: number,
): Promise<void> {
  if (!scope.clientId || tokens <= 0) return;
  await incrementUsage(scope.clientId, "llm_tokens", tokens, {
    byokOverride: byok,
  });
}

async function preflightCap(scope: LLMScope, byok: boolean): Promise<void> {
  if (!scope.clientId) return;
  await assertCapOrBYOK(scope.clientId, "llm_tokens", { byokPresent: byok });
}

const LLM_DEBUG_LOG = process.env.LLM_DEBUG_LOG !== "0";

function logCall(params: {
  mode: "text" | "object";
  provider: ResolvedLLM["provider"];
  modelId: string;
  tier: LLMTier;
  byok: boolean;
  tokens: number;
  scope: LLMScope;
  retried?: string;
}): void {
  if (!LLM_DEBUG_LOG) return;
  const parts = [
    `[llm]`,
    `mode=${params.mode}`,
    `provider=${params.provider}`,
    `model=${params.modelId}`,
    `tier=${params.tier}`,
    `tokens=${params.tokens}`,
    `byok=${params.byok}`,
  ];
  if (params.scope.workspaceId) {
    parts.push(`ws=${params.scope.workspaceId.slice(0, 8)}`);
  }
  if (params.scope.clientId) {
    parts.push(`client=${params.scope.clientId.slice(0, 8)}`);
  }
  if (params.retried) {
    parts.push(`retried_from=${params.retried}`);
  }
  console.log(parts.join(" "));
}

function shouldRetryOnOpenRouter(
  resolved: ResolvedLLM,
  err: unknown,
): boolean {
  if (resolved.provider !== "openrouter") return false;
  if (err instanceof APICallError) {
    if (err.statusCode && err.statusCode >= 500) return true;
    if (err.isRetryable) return true;
  }
  return false;
}

function openRouterFallbackLM(resolved: ResolvedLLM, tier: LLMTier) {
  const altModelId = openRouterFallbackModel(tier);
  if (altModelId === resolved.modelId) return null;
  const openrouter = createOpenRouter({ apiKey: resolved.apiKey });
  return { model: openrouter.chat(altModelId), modelId: altModelId };
}

export async function opsGenerateText(
  opts: OpsGenerateOptions,
): Promise<OpsGenerateTextResult> {
  const resolved = await resolveLLMProvider(opts.scope, opts.tier);
  await preflightCap(opts.scope, resolved.byok);

  const providerOptions = providerOptionsFor(resolved.provider, opts);

  const runOnce = async (
    model: ResolvedLLM["model"],
    modelId: string,
    retriedFrom?: string,
  ) => {
    const result = await generateText({
      model,
      system: opts.system,
      messages: opts.messages,
      tools: opts.tools,
      maxOutputTokens: opts.maxTokens,
      temperature: opts.temperature,
      providerOptions,
    });
    const tokens = totalTokens(result.usage);
    await meterIfApplicable(opts.scope, resolved.byok, tokens);
    logCall({
      mode: "text",
      provider: resolved.provider,
      modelId,
      tier: opts.tier,
      byok: resolved.byok,
      tokens,
      scope: opts.scope,
      retried: retriedFrom,
    });
    return {
      text: result.text,
      provider: resolved.provider,
      modelId,
      usage: result.usage,
      tokens,
      toolCalls: result.toolCalls,
      content: result.content,
    } satisfies OpsGenerateTextResult;
  };

  try {
    return await runOnce(resolved.model, resolved.modelId);
  } catch (err) {
    if (!shouldRetryOnOpenRouter(resolved, err)) throw err;
    const fallback = openRouterFallbackLM(resolved, opts.tier);
    if (!fallback) throw err;
    console.warn(
      `[opsGenerate] OpenRouter ${resolved.modelId} failed; retrying on ${fallback.modelId}`,
    );
    return runOnce(fallback.model, fallback.modelId, resolved.modelId);
  }
}

export async function opsGenerateObject<S>(
  opts: OpsGenerateOptions<S> & { schema: ZodType<S> },
): Promise<OpsGenerateObjectResult<S>> {
  const resolved = await resolveLLMProvider(opts.scope, opts.tier);
  await preflightCap(opts.scope, resolved.byok);

  const providerOptions = providerOptionsFor(resolved.provider, opts);

  const runOnce = async (
    model: ResolvedLLM["model"],
    modelId: string,
    retriedFrom?: string,
  ) => {
    const result = (await generateObject({
      model,
      system: opts.system,
      messages: opts.messages,
      schema: opts.schema,
      maxOutputTokens: opts.maxTokens,
      temperature: opts.temperature,
      providerOptions,
    } as Parameters<typeof generateObject>[0])) as GenerateObjectResult<S>;
    const tokens = totalTokens(result.usage);
    await meterIfApplicable(opts.scope, resolved.byok, tokens);
    logCall({
      mode: "object",
      provider: resolved.provider,
      modelId,
      tier: opts.tier,
      byok: resolved.byok,
      tokens,
      scope: opts.scope,
      retried: retriedFrom,
    });
    return {
      object: result.object,
      provider: resolved.provider,
      modelId,
      usage: result.usage,
      tokens,
    } satisfies OpsGenerateObjectResult<S>;
  };

  try {
    return await runOnce(resolved.model, resolved.modelId);
  } catch (err) {
    // One retry: open-source model returned malformed JSON → retry once on same model
    if (NoObjectGeneratedError.isInstance(err)) {
      console.warn(
        `[opsGenerate] ${resolved.provider}:${resolved.modelId} returned no valid object; retrying once`,
      );
      try {
        return await runOnce(resolved.model, resolved.modelId, resolved.modelId);
      } catch (retryErr) {
        if (!shouldRetryOnOpenRouter(resolved, retryErr)) throw retryErr;
        const fallback = openRouterFallbackLM(resolved, opts.tier);
        if (!fallback) throw retryErr;
        return runOnce(fallback.model, fallback.modelId, resolved.modelId);
      }
    }
    if (!shouldRetryOnOpenRouter(resolved, err)) throw err;
    const fallback = openRouterFallbackLM(resolved, opts.tier);
    if (!fallback) throw err;
    console.warn(
      `[opsGenerate] OpenRouter ${resolved.modelId} failed; retrying on ${fallback.modelId}`,
    );
    return runOnce(fallback.model, fallback.modelId, resolved.modelId);
  }
}

export { resolveLLMProvider };
