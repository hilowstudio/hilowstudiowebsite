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

/** Schema for carousel slide structuring */
export const slidesSchema = z.object({
  slides: z
    .array(
      z.object({
        heading: z.string().describe("Short heading, 5-10 words max"),
        body: z.string().describe("Body text, 1-3 sentences max"),
      }),
    )
    .min(2)
    .max(12)
    .describe(
      "5-10 carousel slides. First slide: strong hook/title. Last slide: CTA.",
    ),
});

export type SlidesResult = z.infer<typeof slidesSchema>;

/** Schema for quote-card extraction (single most shareable line from a post) */
export const quoteSchema = z.object({
  quote: z
    .string()
    .max(220)
    .describe(
      "The single most powerful, shareable sentence or short passage from the post. No quotation marks. Under 200 characters.",
    ),
});

export type QuoteResult = z.infer<typeof quoteSchema>;

/** Schema for AI-generated content pillars from the wizard */
export const pillarsSchema = z.object({
  pillars: z
    .array(
      z.object({
        label: z.string().describe("Compelling specific pillar name"),
        shortLabel: z.string().describe("2-3 word abbreviation"),
        description: z.string().describe("1-2 sentences explaining the pillar"),
        funnelRole: z
          .string()
          .describe('e.g. "TOFU primary", "MOFU to BOFU bridge"'),
      }),
    )
    .min(3)
    .max(5),
});

export type PillarsResult = z.infer<typeof pillarsSchema>;

/** Schema for meeting/episode insight extraction (non-podcast flavor). */
export const meetingInsightSchema = z.object({
  brief: z
    .string()
    .describe("3-5 sentence executive summary of the meeting"),
  actionItems: z
    .array(
      z.object({
        body: z.string(),
        speaker: z.string().nullable().optional(),
        timestampSeconds: z.number().nullable().optional(),
      }),
    )
    .describe("Discrete commitments made during the meeting"),
  quotes: z
    .array(
      z.object({
        body: z.string(),
        speaker: z.string().nullable().optional(),
      }),
    )
    .describe("Quotable statements suitable for testimonials or content"),
  signals: z
    .array(
      z.object({
        kind: z.enum(["churn_signal", "upsell_signal", "referral_signal"]),
        body: z.string(),
      }),
    )
    .describe("Business signals surfaced in the conversation"),
});

export type MeetingInsightResult = z.infer<typeof meetingInsightSchema>;
