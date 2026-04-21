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

type AnthropicInput = Parameters<Anthropic["messages"]["create"]>[0];

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
) {
  const { client, byok } = await clientForScope(scope);
  await assertCapOrBYOK(scope.clientId, "llm_tokens", { byokPresent: byok });

  const response = await client.messages.create(input);

  const usage = (
    response as unknown as {
      usage?: { input_tokens?: number; output_tokens?: number };
    }
  ).usage;
  const tokens =
    (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0);
  if (tokens > 0) {
    await incrementUsage(scope.clientId, "llm_tokens", tokens, {
      byokOverride: byok,
    });
  }

  return response;
}
