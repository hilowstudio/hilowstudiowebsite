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

async function clientForScope(scope: {
  workspaceId: string;
  clientId: string;
}): Promise<{ client: Anthropic; byok: boolean }> {
  const override = await resolveSetting("anthropic_api_key", scope);
  if (override && (override.source === "workspace" || override.source === "client")) {
    return {
      client: new Anthropic({ apiKey: override.value }),
      byok: true,
    };
  }
  return { client: getAnthropic(), byok: false };
}

/**
 * Create an Anthropic message under the hybrid cost model.
 *  - Resolves whether to use a workspace/client BYOK key or the platform default.
 *  - Checks the monthly llm_tokens cap for the client (unless BYOK overrides).
 *  - Increments ops_usage_meters after a successful call.
 */
export async function opsCreateMessage(
  scope: { workspaceId: string; clientId: string },
  input: AnthropicInput,
): Promise<AnthropicMessage> {
  const { client, byok } = await clientForScope(scope);
  await assertCapOrBYOK(scope.clientId, "llm_tokens", { byokPresent: byok });

  const response = await client.messages.create(input);

  const tokens =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
  if (tokens > 0) {
    await incrementUsage(scope.clientId, "llm_tokens", tokens, {
      byokOverride: byok,
    });
  }

  return response;
}
