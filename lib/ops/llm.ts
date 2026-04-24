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
import { z, type ZodType } from "zod";

import {
  resolveLLMProvider,
  openRouterFallbackModel,
  debugFetch,
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
  const out: Record<string, Record<string, unknown>> = {};

  if (provider === "anthropic" && opts.thinking) {
    out.anthropic = { thinking: opts.thinking };
  }

  // Intentionally do NOT pass an OpenRouter provider override. The account's
  // Organization Privacy + Workspace Guardrail are the source of truth for
  // which endpoints are eligible. If a request fails with "No endpoints
  // matching your guardrail restrictions and data policy," we want to SEE
  // that — not silently overrule it — so we can diagnose the actual cause.
  //
  // If we ever need a debug escape hatch, set OPENROUTER_FORCE_ALLOW_DATA=1
  // to add `provider.data_collection: "allow"` per-request.
  if (
    provider === "openrouter" &&
    process.env.OPENROUTER_FORCE_ALLOW_DATA === "1"
  ) {
    out.openrouter = {
      provider: { data_collection: "allow", allow_fallbacks: true },
    };
  }

  return (Object.keys(out).length > 0 ? out : undefined) as ProviderOptions;
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

function logError(params: {
  provider: ResolvedLLM["provider"];
  modelId: string;
  tier: LLMTier;
  err: unknown;
}): void {
  if (!LLM_DEBUG_LOG) return;
  const base = `[llm:error] provider=${params.provider} model=${params.modelId} tier=${params.tier}`;
  // Duck-type APICallError shape. The OpenRouter provider bundles its own
  // copy of @ai-sdk/provider, so the thrown error isn't instanceof APICallError
  // from the `ai` package even though it carries the same fields.
  const e = params.err as Record<string, unknown> | undefined;
  const msg =
    params.err instanceof Error ? params.err.message : String(params.err);
  const extras: string[] = [];
  if (e && typeof e === "object") {
    for (const key of [
      "code",
      "status",
      "statusCode",
      "retryable",
      "isRetryable",
      "responseBody",
      "requestBodyValues",
      "url",
      "responseHeaders",
      "response",
      "cause",
      "data",
      "error",
    ]) {
      const v = e[key];
      if (v !== undefined) {
        extras.push(
          `${key}=${typeof v === "string" ? v : JSON.stringify(v)}`,
        );
      }
    }
  }
  // Use APICallError fancy format when available (native `ai` errors); else
  // dump extras.
  if (params.err instanceof APICallError) {
    const body = params.err.responseBody ?? "(no body)";
    const reqBody = params.err.requestBodyValues
      ? JSON.stringify(params.err.requestBodyValues)
      : "(no request body)";
    console.error(
      `${base} status=${params.err.statusCode ?? "?"} retryable=${params.err.isRetryable} message=${params.err.message}\n${base} response=${body}\n${base} request=${reqBody}`,
    );
    return;
  }
  console.error(
    `${base} error=${msg}${extras.length ? " " + extras.join(" ") : ""}`,
  );
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

/**
 * OpenRouter's endpoint filter drops endpoints that can't honor the
 * requested max_tokens. Kimi K2.6 via Parasail and several other upstream
 * providers have conservative output limits; passing 4000+ eliminates them
 * and triggers the misleading "No endpoints matching your guardrail
 * restrictions and data policy" 404. For OpenRouter we omit max_tokens and
 * let the upstream provider apply its default ceiling.
 */
function maxTokensFor(
  provider: ResolvedLLM["provider"],
  requested: number | undefined,
): number | undefined {
  if (provider === "openrouter") return undefined;
  return requested;
}

function openRouterFallbackLM(resolved: ResolvedLLM, tier: LLMTier) {
  const altModelId = openRouterFallbackModel(tier);
  if (altModelId === resolved.modelId) return null;
  const openrouter = createOpenRouter({
    apiKey: resolved.apiKey,
    fetch: debugFetch,
  });
  return {
    model: openrouter.chat(altModelId),
    modelId: altModelId,
  };
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
      maxOutputTokens: maxTokensFor(resolved.provider, opts.maxTokens),
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
    logError({
      provider: resolved.provider,
      modelId: resolved.modelId,
      tier: opts.tier,
      err,
    });
    if (!shouldRetryOnOpenRouter(resolved, err)) throw err;
    const fallback = openRouterFallbackLM(resolved, opts.tier);
    if (!fallback) throw err;
    console.warn(
      `[opsGenerate] OpenRouter ${resolved.modelId} failed; retrying on ${fallback.modelId}`,
    );
    return runOnce(fallback.model, fallback.modelId, resolved.modelId);
  }
}

/**
 * Build a JSON-Schema hint for the model. Zod v4 exposes `z.toJSONSchema`
 * which emits a valid draft-07 JSON Schema from any ZodType.
 */
function schemaAsJsonSchemaString(schema: ZodType<unknown>): string {
  try {
    const js = z.toJSONSchema(
      schema as unknown as Parameters<typeof z.toJSONSchema>[0],
    );
    return JSON.stringify(js, null, 2);
  } catch {
    return "(schema description unavailable; infer structure from field names)";
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  }
  return trimmed;
}

function extractJsonObject(text: string): string {
  const stripped = stripCodeFences(text);
  // If the model added prose before/after, pull out the first balanced { ... }.
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return stripped.slice(first, last + 1);
  }
  return stripped;
}

/**
 * OpenRouter-specific path for structured output. The @openrouter/ai-sdk-provider
 * hardcodes `strict: true` on json_schema response_format, which filters out
 * every Kimi/GLM/Qwen endpoint that doesn't advertise strict-schema support.
 * Instead of fighting that, we use plain `generateText` with a JSON Schema
 * hint in the system prompt, then parse + Zod-validate the response
 * client-side. Equivalent output contract, zero dependence on provider
 * response_format negotiation.
 */
async function generateObjectViaText<S>(
  opts: OpsGenerateOptions<S> & { schema: ZodType<S> },
  resolved: ResolvedLLM,
  modelId: string,
  retriedFrom?: string,
): Promise<OpsGenerateObjectResult<S>> {
  const schemaHint = schemaAsJsonSchemaString(opts.schema);
  const jsonInstructions = [
    "## Output format",
    "Respond with ONLY a JSON object that matches the schema below.",
    "- Begin your response with `{` and end it with `}`.",
    "- No markdown code fences. No prose. No preamble. No commentary.",
    "- All required fields must be present. Use the exact field names.",
    "",
    "```json",
    schemaHint,
    "```",
  ].join("\n");

  const mergedSystem = [opts.system, jsonInstructions]
    .filter(Boolean)
    .join("\n\n");

  const result = await generateText({
    model: resolved.model,
    system: mergedSystem,
    messages: opts.messages,
    maxOutputTokens: maxTokensFor(resolved.provider, opts.maxTokens),
    temperature: opts.temperature,
  });

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

  const rawJson = extractJsonObject(result.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (parseErr) {
    throw new Error(
      `Model returned non-JSON output (${resolved.provider}:${modelId}). First 400 chars: ${result.text.slice(0, 400)} | parseErr=${(parseErr as Error).message}`,
    );
  }

  const validated = opts.schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Model output failed Zod validation (${resolved.provider}:${modelId}): ${validated.error.message}`,
    );
  }

  return {
    object: validated.data,
    provider: resolved.provider,
    modelId,
    usage: result.usage,
    tokens,
  } satisfies OpsGenerateObjectResult<S>;
}

export async function opsGenerateObject<S>(
  opts: OpsGenerateOptions<S> & { schema: ZodType<S> },
): Promise<OpsGenerateObjectResult<S>> {
  const resolved = await resolveLLMProvider(opts.scope, opts.tier);
  await preflightCap(opts.scope, resolved.byok);

  // OpenRouter: use text-based schema path (bypass response_format entirely).
  if (resolved.provider === "openrouter") {
    try {
      return await generateObjectViaText(opts, resolved, resolved.modelId);
    } catch (err) {
      logError({
        provider: resolved.provider,
        modelId: resolved.modelId,
        tier: opts.tier,
        err,
      });
      // Retry once on the same model (transient parse/validation failure).
      try {
        return await generateObjectViaText(
          opts,
          resolved,
          resolved.modelId,
          resolved.modelId,
        );
      } catch (retryErr) {
        if (!shouldRetryOnOpenRouter(resolved, retryErr)) throw retryErr;
        const fallback = openRouterFallbackLM(resolved, opts.tier);
        if (!fallback) throw retryErr;
        const fallbackResolved: ResolvedLLM = {
          ...resolved,
          model: fallback.model,
          modelId: fallback.modelId,
        };
        return generateObjectViaText(
          opts,
          fallbackResolved,
          fallback.modelId,
          resolved.modelId,
        );
      }
    }
  }

  // Native providers: use the SDK's built-in structured output.
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
    logError({
      provider: resolved.provider,
      modelId: resolved.modelId,
      tier: opts.tier,
      err,
    });
    if (NoObjectGeneratedError.isInstance(err)) {
      console.warn(
        `[opsGenerate] ${resolved.provider}:${resolved.modelId} returned no valid object; retrying once`,
      );
      return runOnce(resolved.model, resolved.modelId, resolved.modelId);
    }
    throw err;
  }
}

export { resolveLLMProvider };
