import { resolveSetting } from "@/lib/ops/settings";

const FIREFLIES_ENDPOINT = "https://api.fireflies.ai/graphql";

export type FirefliesTranscript = {
  id: string;
  title: string | null;
  date: number | null;
  duration: number | null;
  transcript_url: string | null;
  audio_url: string | null;
  participants: string[];
  speakers: { id: number; name: string }[];
  sentences: { index: number; speaker_name: string; text: string; start_time: number }[];
};

async function callFireflies<T>(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(FIREFLIES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fireflies HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors && json.errors.length > 0) {
    throw new Error(`Fireflies error: ${json.errors[0].message}`);
  }
  if (!json.data) {
    throw new Error("Fireflies returned no data");
  }
  return json.data;
}

const TRANSCRIPTS_LIST_QUERY = `
  query RecentTranscripts($limit: Int!) {
    transcripts(limit: $limit) {
      id
      title
      date
      duration
      transcript_url
      audio_url
      participants
    }
  }
`;

const TRANSCRIPT_DETAIL_QUERY = `
  query Transcript($id: String!) {
    transcript(id: $id) {
      id
      title
      date
      duration
      transcript_url
      audio_url
      participants
      speakers {
        id
        name
      }
      sentences {
        index
        speaker_name
        text
        start_time
      }
    }
  }
`;

async function resolveApiKey(
  workspaceId: string,
  clientId: string,
): Promise<string> {
  const resolved = await resolveSetting("fireflies_api_key", {
    workspaceId,
    clientId,
  });
  if (!resolved) {
    throw new Error("Fireflies API key not configured for this client");
  }
  return resolved.value;
}

export async function listRecentTranscripts(options: {
  workspaceId: string;
  clientId: string;
  limit?: number;
}): Promise<Pick<FirefliesTranscript, "id" | "title" | "date" | "duration" | "transcript_url" | "audio_url" | "participants">[]> {
  const apiKey = await resolveApiKey(options.workspaceId, options.clientId);
  const limit = options.limit ?? 20;
  const data = await callFireflies<{
    transcripts: Pick<FirefliesTranscript, "id" | "title" | "date" | "duration" | "transcript_url" | "audio_url" | "participants">[];
  }>(apiKey, TRANSCRIPTS_LIST_QUERY, { limit });
  return data.transcripts ?? [];
}

export async function fetchTranscriptDetail(options: {
  workspaceId: string;
  clientId: string;
  externalId: string;
}): Promise<FirefliesTranscript> {
  const apiKey = await resolveApiKey(options.workspaceId, options.clientId);
  const data = await callFireflies<{ transcript: FirefliesTranscript }>(
    apiKey,
    TRANSCRIPT_DETAIL_QUERY,
    { id: options.externalId },
  );
  return data.transcript;
}

export function concatenateSentences(
  sentences: FirefliesTranscript["sentences"],
): string {
  const lines: string[] = [];
  let currentSpeaker = "";
  let buffer: string[] = [];

  for (const sentence of sentences) {
    if (sentence.speaker_name !== currentSpeaker) {
      if (buffer.length) {
        lines.push(`${currentSpeaker}: ${buffer.join(" ")}`);
        buffer = [];
      }
      currentSpeaker = sentence.speaker_name;
    }
    buffer.push(sentence.text);
  }
  if (buffer.length) {
    lines.push(`${currentSpeaker}: ${buffer.join(" ")}`);
  }
  return lines.join("\n\n");
}
