import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { ingestArticle } from "@/inngest/functions/ingest-article";
import { ingestBook } from "@/inngest/functions/ingest-book";
import { processEpisode } from "@/inngest/functions/process-episode";
import { postFirstComment } from "@/inngest/functions/post-first-comment";
import { generateCarousel } from "@/inngest/functions/generate-carousel";
import { generateImage } from "@/inngest/functions/generate-image";
import { checkRepurpose } from "@/inngest/functions/check-repurpose";
import { studioWeeklyUpdates } from "@/inngest/functions/studio-weekly-updates";
import { opsFirefliesSync } from "@/inngest/functions/ops-fireflies-sync";
import { opsNetworkDigest } from "@/inngest/functions/ops-network-digest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ingestArticle,
    ingestBook,
    processEpisode,
    postFirstComment,
    generateCarousel,
    generateImage,
    checkRepurpose,
    studioWeeklyUpdates,
    opsFirefliesSync,
    opsNetworkDigest,
  ],
});
