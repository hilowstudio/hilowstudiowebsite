import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { opsGenerateObject } from "@/lib/ops/llm";
import { insightSchema } from "@/lib/ai/schemas";
import {
  transcribeAudio,
  fetchYouTubeTranscript,
} from "@/lib/sources/transcribe";

export const processEpisode = inngest.createFunction(
  {
    id: "process-episode",
    retries: 2,
    triggers: [{ event: "source/episode.process" }],
  },
  async ({ event, step }) => {
    const { sourceId } = event.data as { sourceId: string };

    // Step 1: Fetch the idea row (created by the UI with raw metadata)
    const idea = await step.run("fetch-idea", async () => {
      const { data, error } = await supabase
        .from("content_ideas")
        .select("*")
        .eq("id", sourceId)
        .single();
      if (error || !data) throw new Error(`Idea ${sourceId} not found`);
      return data;
    });

    const meta = (idea.source_metadata || {}) as Record<string, unknown>;
    const audioUrl = meta.audio_url as string | undefined;
    const youtubeId = meta.youtube_id as string | undefined;
    const existingTranscriptUrl = meta.transcript_url as string | undefined;

    // Step 2: Get transcript (cheapest source first)
    const transcript = await step.run("get-transcript", async () => {
      // Priority 1: Existing transcript URL from RSS (free, instant)
      if (existingTranscriptUrl) {
        try {
          const res = await fetch(existingTranscriptUrl);
          if (res.ok) {
            const text = await res.text();
            return {
              rawTranscript: text,
              timestampedTranscript: text,
              source: "rss_transcript" as const,
            };
          }
        } catch {
          // Fall through
        }
      }

      // Priority 2: YouTube captions (free, instant)
      if (youtubeId) {
        const ytResult = await fetchYouTubeTranscript(youtubeId);
        if (ytResult) {
          return { ...ytResult, source: "youtube_captions" as const };
        }
      }

      // Priority 3: Deepgram transcription (paid)
      if (audioUrl) {
        const result = await transcribeAudio(audioUrl);
        return { ...result, source: "deepgram" as const };
      }

      throw new Error(
        "No audio URL or YouTube ID available for transcription",
      );
    });

    // Step 3: AI analysis via structured output
    const insights = await step.run("analyze-transcript", async () => {
      const result = await opsGenerateObject({
        scope: {
          workspaceId: idea.workspace_id ?? null,
          clientId: idea.client_id ?? null,
        },
        tier: "standard",
        messages: [
          {
            role: "user",
            content: `You are analyzing a podcast/video transcript. Extract insights.

- Summary: Concise 2-3 sentences.
- Key Takeaways: Exactly 5 bullet points.
- Chapters: Identify 5-10 key chapters with titles and [MM:SS] timestamps.
- Entities: Extract key People, Books, and Concepts discussed.

Transcript:
${transcript.timestampedTranscript || transcript.rawTranscript}`,
          },
        ],
        schema: insightSchema,
      });
      return result.object;
    });

    // Step 4: Update the idea with processed data
    await step.run("update-idea", async () => {
      const updatedMeta = {
        ...meta,
        summary: insights.summary,
        key_takeaways: insights.keyTakeaways,
        chapters: insights.chapters,
        entities: insights.entities,
        transcript_source: transcript.source,
        processed: true,
      };

      const { error } = await supabase
        .from("content_ideas")
        .update({
          raw_insight: insights.summary,
          source_metadata: updatedMeta,
        })
        .eq("id", sourceId);

      if (error) throw error;
    });

    return { status: "processed", ideaId: sourceId };
  },
);
