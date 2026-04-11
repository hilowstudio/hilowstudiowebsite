import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { bookSummarySchema } from "@/lib/ai/schemas";

export const ingestBook = inngest.createFunction(
  {
    id: "ingest-book",
    retries: 2,
    triggers: [{ event: "source/book.ingest" }],
  },
  async ({ event, step }) => {
    const book = event.data as {
      title: string;
      authors: string[];
      description?: string;
      publisher?: string;
      publishedDate?: string;
      pageCount?: number;
      coverUrl?: string;
      isbn?: string;
      categories?: string[];
    };
    const externalId = `book:${book.isbn || book.title}`;

    // Step 1: Check for duplicate
    const existing = await step.run("check-duplicate", async () => {
      const { data } = await supabase
        .from("content_ideas")
        .select("id")
        .eq("source_metadata->>external_id", externalId)
        .maybeSingle();
      return data;
    });

    if (existing) {
      return { status: "duplicate", ideaId: existing.id };
    }

    // Step 2: Generate deep summary using AI + training data
    const analysis = await step.run("summarize-book", async () => {
      const authorStr = book.authors.length
        ? ` by ${book.authors.join(", ")}`
        : "";
      const descStr = book.description
        ? `\n\nPublisher description: ${book.description}`
        : "";
      const catStr = book.categories?.length
        ? `\nCategories: ${book.categories.join(", ")}`
        : "";

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: bookSummarySchema,
        messages: [
          {
            role: "user",
            content: `You are a knowledgeable literary analyst. Generate a deep summary of this book using your training data and any available context.

Book: "${book.title}"${authorStr}
${book.publisher ? `Publisher: ${book.publisher}` : ""}
${book.publishedDate ? `Published: ${book.publishedDate}` : ""}
${book.pageCount ? `Pages: ${book.pageCount}` : ""}${descStr}${catStr}

Provide:
1. A deep 3-5 sentence summary of the book's core thesis and contribution
2. Key concepts and takeaways (3-7 items)
3. Reconstructed table of contents (main chapters/sections)
4. Key entities (people, concepts, related works mentioned or relevant)`,
          },
        ],
      });
      return object;
    });

    // Step 3: Create content idea
    const idea = await step.run("create-idea", async () => {
      const { data, error } = await supabase
        .from("content_ideas")
        .insert({
          raw_insight: `Book: "${book.title}"${book.authors.length ? ` by ${book.authors.join(", ")}` : ""}. ${analysis.summary.slice(0, 500)}`,
          source: "book",
          source_metadata: {
            source_system: "hi-low",
            external_id: externalId,
            title: book.title,
            authors: book.authors,
            summary: analysis.summary,
            key_takeaways: analysis.keyTakeaways,
            table_of_contents: analysis.tableOfContents,
            entities: analysis.entities,
            page_count: book.pageCount,
            subjects: book.categories || [],
            cover_url: book.coverUrl,
          },
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return { status: "created", ideaId: idea.id };
  }
);
