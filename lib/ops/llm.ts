import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { resolveSetting } from "@/lib/ops/settings";
import {
  assertCapOrBYOK,
  incrementUsage,
  QuotaExceededError,
} from "@/lib/ops/meters";

export { QuotaExceededError };
export { SONNET_MODEL };

type AnthropicInput = Anthropic.Messages.MessageCreateParamsNonStreaming;
type AnthropicMessage = Anthropic.Messages.Message;

export type OpsLlmScope = {
  workspaceId: string;
  clientId?: string | null;
};

async function clientForScope(scope: OpsLlmScope): Promise<{
  client: Anthropic;
  byok: boolean;
}> {
  const override = await resolveSetting("anthropic_api_key", {
    workspaceId: scope.workspaceId,
    clientId: scope.clientId ?? null,
  });
  if (
    override &&
    (override.source === "workspace" || override.source === "client")
  ) {
    return {
      client: new Anthropic({ apiKey: override.value }),
      byok: true,
    };
  }
  return { client: getAnthropic(), byok: false };
}

/**
 * Create an Anthropic message under the hybrid cost model.
 * - Scope with clientId: enforces that client's LLM cap + increments its meter.
 * - Scope without clientId (lead drafts, workspace-level content, etc.): uses
 *   the resolved key (workspace BYOK if present, else platform). No metering.
 *   These calls are absorbed by the platform license.
 */
export async function opsCreateMessage(
  scope: OpsLlmScope,
  input: AnthropicInput,
): Promise<AnthropicMessage> {
  const { client, byok } = await clientForScope(scope);

  if (scope.clientId) {
    await assertCapOrBYOK(scope.clientId, "llm_tokens", { byokPresent: byok });
  }

  const response = await client.messages.create(input);

  if (scope.clientId) {
    const tokens =
      (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
    if (tokens > 0) {
      await incrementUsage(scope.clientId, "llm_tokens", tokens, {
        byokOverride: byok,
      });
    }
  }

  return response;
}
