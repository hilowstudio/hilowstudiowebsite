import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { ingestArticle } from "@/inngest/functions/ingest-article";
import { ingestBook } from "@/inngest/functions/ingest-book";
import { processEpisode } from "@/inngest/functions/process-episode";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [ingestArticle, ingestBook, processEpisode],
});
