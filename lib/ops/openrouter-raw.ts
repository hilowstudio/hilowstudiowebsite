/**
 * Raw OpenRouter client. Replaces @openrouter/ai-sdk-provider for hi-low's
 * OpenRouter calls because the SDK's User-Agent (`ai-sdk/openrouter/...`) +
 * Vercel outbound IP combination triggers a filter that returns the
 * misleading "No endpoints available matching your guardrail restrictions
 * and data policy" 404. Raw fetch from the same Vercel function with a
 * neutral User-Agent succeeds.
 *
 * Only handles what hi-low uses: non-streaming chat completions. No tools,
 * no function calling, no streaming. Structured output is done client-side
 * by prompt-injecting JSON Schema and parsing + Zod-validating the response.
 */

import type { ModelMessage } from "ai";

export type OpenRouterRawResult = {
  text: string;
  modelId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  provider: string;
};

export class OpenRouterRawError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "OpenRouterRawError";
    this.status = status;
    this.body = body;
  }
}

type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string };

function toOpenRouterMessages(messages: ModelMessage[]): ChatMessage[] {
  return messages.map((m) => {
    const raw = m as unknown as { role: string; content: unknown };
    let content: string;
    if (typeof raw.content === "string") {
      content = raw.content;
    } else if (Array.isArray(raw.content)) {
      content = raw.content
        .map((part) => {
          if (typeof part === "string") return part;
          const p = part as { type?: string; text?: string };
          return p.type === "text" && typeof p.text === "string" ? p.text : "";
        })
        .join("");
    } else {
      content = String(raw.content ?? "");
    }
    const role = raw.role as "system" | "user" | "assistant";
    return { role, content };
  });
}

export async function openrouterRawChat(params: {
  apiKey: string;
  modelId: string;
  system?: string;
  messages: ModelMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<OpenRouterRawResult> {
  const messages: ChatMessage[] = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  messages.push(...toOpenRouterMessages(params.messages));

  const body: Record<string, unknown> = {
    model: params.modelId,
    messages,
  };
  if (params.maxTokens != null) body.max_tokens = params.maxTokens;
  if (params.temperature != null) body.temperature = params.temperature;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new OpenRouterRawError(
      `OpenRouter ${res.status}: ${text.slice(0, 300)}`,
      res.status,
      text,
    );
  }

  const json = (await res.json()) as {
    model?: string;
    provider?: string;
    choices?: { message?: { content?: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  const text = json.choices?.[0]?.message?.content ?? "";
  return {
    text,
    modelId: json.model ?? params.modelId,
    provider: json.provider ?? "(unknown)",
    usage: {
      inputTokens: json.usage?.prompt_tokens ?? 0,
      outputTokens: json.usage?.completion_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
    },
  };
}
