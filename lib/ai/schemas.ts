import { z } from "zod";

/** Schema for AI analysis of podcast/video transcripts */
export const insightSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the episode (2-3 sentences)"),
  keyTakeaways: z
    .array(z.string())
    .length(5)
    .describe("Exactly 5 key bullet points from the episode"),
  chapters: z
    .array(
      z.object({
        title: z.string().describe("Chapter title"),
        start: z.string().describe("Start timestamp in [MM:SS] format"),
        reason: z
          .string()
          .describe("Why this segment is important"),
      })
    )
    .describe("Key segments/chapters with timestamps"),
  entities: z
    .array(
      z.object({
        name: z
          .string()
          .describe("Name of the person, book, or concept"),
        type: z
          .enum([
            "PERSON",
            "BOOK",
            "CONCEPT",
            "ORGANIZATION",
            "TECHNOLOGY",
          ])
          .describe("Type of entity"),
        description: z
          .string()
          .describe("Brief context about why this entity was mentioned"),
      })
    )
    .describe("People, books, concepts, organizations, technologies mentioned"),
});

export type InsightResult = z.infer<typeof insightSchema>;

/** Schema for AI article summarization */
export const articleSummarySchema = z.object({
  summary: z.string().describe("A concise summary of the article (2-3 sentences)"),
  keyTakeaways: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("3-5 key points from the article"),
  entities: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["PERSON", "BOOK", "CONCEPT", "ORGANIZATION", "TECHNOLOGY"]),
      })
    )
    .describe("Key entities mentioned"),
});

export type ArticleSummaryResult = z.infer<typeof articleSummarySchema>;

/** Schema for AI book summarization (from metadata + training data) */
export const bookSummarySchema = z.object({
  summary: z
    .string()
    .describe("A deep 3-5 sentence summary of the book's core thesis and contribution"),
  keyTakeaways: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe("Key concepts and takeaways"),
  tableOfContents: z
    .array(z.string())
    .describe("Reconstructed table of contents (main chapters/sections)"),
  entities: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["PERSON", "BOOK", "CONCEPT", "ORGANIZATION", "TECHNOLOGY"]),
      })
    )
    .describe("Key people, concepts, and related works"),
});

export type BookSummaryResult = z.infer<typeof bookSummarySchema>;
