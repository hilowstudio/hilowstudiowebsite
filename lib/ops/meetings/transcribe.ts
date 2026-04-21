import { createClient } from "@deepgram/sdk";
import { resolveSetting } from "@/lib/ops/settings";

export type OpsTranscriptResult = {
  rawTranscript: string;
  timestampedTranscript: string;
  durationSeconds: number | null;
};

export async function transcribeViaDeepgram(
  audioUrl: string,
  scope: { workspaceId: string; clientId: string },
): Promise<OpsTranscriptResult> {
  const key = await resolveSetting("deepgram_api_key", scope);
  if (!key) {
    throw new Error(
      "Deepgram API key not configured (add it via integrations or platform settings)",
    );
  }

  const deepgram = createClient(key.value);

  const { result } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    {
      model: "nova-2",
      smart_format: true,
      punctuate: true,
      paragraphs: true,
      diarize: true,
    },
  );

  const paragraphs =
    result?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs
      ?.paragraphs || [];

  const durationSeconds =
    (result as { metadata?: { duration?: number } } | undefined)?.metadata
      ?.duration ?? null;

  const rawParts: string[] = [];
  const timestampedParts: string[] = [];

  for (const para of paragraphs) {
    for (const sentence of para.sentences || []) {
      rawParts.push(sentence.text);
      const mins = Math.floor(sentence.start / 60);
      const secs = Math.floor(sentence.start % 60);
      const ts = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      timestampedParts.push(`[${ts}] ${sentence.text}`);
    }
  }

  if (rawParts.length === 0) {
    const flat =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    return { rawTranscript: flat, timestampedTranscript: flat, durationSeconds };
  }

  return {
    rawTranscript: rawParts.join(" "),
    timestampedTranscript: timestampedParts.join("\n"),
    durationSeconds,
  };
}
