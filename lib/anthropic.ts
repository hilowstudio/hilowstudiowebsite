import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Missing ANTHROPIC_API_KEY env var");
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export const SONNET_MODEL = "claude-sonnet-4-6";
