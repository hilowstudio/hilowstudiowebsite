import { createClient } from "@deepgram/sdk";

export interface TranscriptResult {
  rawTranscript: string;
  timestampedTranscript: string;
}

export async function transcribeAudio(
  audioUrl: string
): Promise<TranscriptResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPGRAM_API_KEY env var");

  const deepgram = createClient(apiKey);

  const { result } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    {
      model: "nova-2",
      smart_format: true,
      punctuate: true,
      paragraphs: true,
      diarize: true,
    }
  );

  const paragraphs =
    result?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs
      ?.paragraphs || [];

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
    // Fallback to flat transcript
    const flat =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    return { rawTranscript: flat, timestampedTranscript: flat };
  }

  return {
    rawTranscript: rawParts.join(" "),
    timestampedTranscript: timestampedParts.join("\n"),
  };
}

export async function fetchYouTubeTranscript(
  youtubeId: string
): Promise<TranscriptResult | null> {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const captions = await YoutubeTranscript.fetchTranscript(youtubeId);

    if (!captions || captions.length === 0) return null;

    const raw = captions.map((c) => c.text).join(" ");
    const timestamped = captions
      .map((c) => {
        const secs = Math.floor(c.offset / 1000);
        const mins = Math.floor(secs / 60);
        const rem = secs % 60;
        return `[${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}] ${c.text}`;
      })
      .join("\n");

    return { rawTranscript: raw, timestampedTranscript: timestamped };
  } catch {
    return null;
  }
}
