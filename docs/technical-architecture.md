# LinkedIn Content Manager: Technical Architecture

## Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript 5.7)
- **Database:** Supabase PostgreSQL (service-role client, RLS enabled)
- **AI Generation:** Anthropic Claude Sonnet 4.6 (content generation, voice synthesis, quote extraction, carousel structuring)
- **AI Analysis:** Google Gemini 2.5 Flash (source material summarization, transcript analysis, entity extraction)
- **Background Jobs:** Inngest (event-driven, retries, delayed execution)
- **Transcription:** Deepgram Nova-2 (audio-to-text with diarization)
- **PDF Generation:** @react-pdf/renderer (carousel PDFs, quote cards)
- **Hosting:** Vercel
- **Auth:** Custom JWT (bcrypt + jose, HttpOnly cookie, SameSite=Strict)

---

## Database Schema

### Core Tables

**content_posts** — LinkedIn posts through their lifecycle.
- `body` (TEXT), `title`, `post_type` (text/carousel/poll/article)
- `status` (draft/scheduled/publishing/published/failed)
- `hook_type`, `funnel_stage`, `content_pillar` — strategy tags
- `first_comment` (TEXT), `first_comment_delay_minutes` (INT), `first_comment_posted` (BOOL)
- `linkedin_post_id`, `error_message`, `metadata` (JSONB — stores carousel_pdf, post_image as base64)
- `scheduled_at`, `published_at`, `week_number`

**content_ideas** — Source material library.
- `raw_insight` (TEXT), `source` (IdeaSource enum: book/podcast/youtube/article/repurpose/external)
- `source_url`, `source_material`, `source_metadata` (JSONB — structured data varies by source type)
- `status` (active/hidden), `use_count` (INT)
- `suggested_hook`, `suggested_funnel`, `suggested_pillar`

**content_pillars** — User-defined content strategy pillars.
- `slug`, `label`, `short_label`, `description`, `funnel_role`, `color_class`, `sort_order`

**voice_guide** — Voice persona and rules.
- `category` (principle/do/dont/reference_post), `content` (TEXT), `sort_order`

**linkedin_connections** — OAuth tokens for LinkedIn publishing.
- `person_urn`, `access_token`, `refresh_token`, `expires_at`, `status` (active/needs_reauth/revoked)

**linkedin_metrics** — Engagement data per post.
- `post_id`, `impressions`, `likes`, `comments`, `shares`, `clicks`, `fetched_at`

**app_settings** — Key-value store (JSONB) for preferences like enabled hook types.

### Migrations (010 total)
001: Initial schema (contacts, bookings, posts, activities, metrics)
002: Content strategy (hook_type, funnel_stage, ideas table, voice_guide)
003: Content pillars column
004: LinkedIn connections table
005: Idea source material fields
006: Idea source_metadata JSONB
007: Source material rework (active/hidden status, use_count)
008: First comment columns
009: App settings table (hook preferences)
010: Content pillars table (replaces hardcoded pillars)

---

## LinkedIn API Integration

**Endpoint:** `/rest/posts` (Posts API, versioned with `LinkedIn-Version: 202603`)

**Auth:** OAuth 2.0 via Sign In with LinkedIn (OpenID Connect) + Share on LinkedIn product. Scopes: `openid profile email w_member_social`.

**Publishing Functions** (`lib/linkedin.ts`):
- `publishTextPost(text)` — text-only post
- `publishDocumentPost(text, documentUrn, title)` — carousel/document post
- `publishImagePost(text, imageUrn)` — image post (available but unused currently)
- `uploadDocument(pdfBuffer, title)` — Documents API: initializeUpload → PUT binary → returns `urn:li:document`
- `uploadImage(imageBuffer, contentType)` — Assets API: registerUpload → POST binary → returns asset URN
- `postComment(postUrn, commentText)` — Comments API at `/rest/socialActions/{postUrn}/comments`

**Token Management:**
- Tokens stored in `linkedin_connections` with expiry tracking
- `getActiveConnection()` checks expiry, flips to `needs_reauth` if expired
- 401 responses auto-trigger `markNeedsReauth()`
- OAuth callback at `/api/auth/linkedin/callback` handles code exchange + userinfo fetch
- State cookie (HttpOnly, SameSite=Lax) for CSRF protection on OAuth flow

---

## AI Generation Pipeline

### Content Generation (`lib/generate-post.ts`)

**System prompt assembly:**
1. `PERSONA_SYSTEM_PROMPT` (code constant — universal guardrails)
2. DB `voice_guide` principle row (user's custom persona)
3. Content pillar description + funnel role (from `content_pillars` table)
4. Hook type description
5. Funnel stage description
6. Output constraint: "Return ONLY the post body. No preamble."

**Source context assembly** (`assembleSourceContext()`):
- Concatenates `raw_insight` + structured metadata fields (title, authors, summary, key_takeaways, chapters, entities, table_of_contents)
- Passes `source_url` for Claude's web_fetch tool if present

**Model config:** Claude Sonnet 4.6, `max_tokens: 16000`, `thinking: { type: "adaptive" }`, `web_fetch_20260209` tool enabled when source URL present.

### Source Analysis (Inngest functions)

**Book ingestion** (`inngest/functions/ingest-book.ts`):
- Gemini 2.5 Flash with `bookSummarySchema` (Zod) — generates summary, key takeaways, table of contents, entities

**Episode processing** (`inngest/functions/process-episode.ts`):
- Transcript acquisition: RSS transcript URL → YouTube captions → Deepgram Nova-2 (with diarize, smart_format, paragraphs)
- Gemini 2.5 Flash with `insightSchema` (Zod) — extracts summary (5 takeaways), chapters with timestamps, entity graph

**Article ingestion** (`inngest/functions/ingest-article.ts`):
- Gemini 2.5 Flash with `articleSummarySchema` (Zod) — summary, takeaways, entities

### Voice Persona Generation (`app/api/admin/voice/generate-persona/route.ts`)

13-question wizard feeds into Claude Sonnet 4.6 with a detailed synthesis prompt. Output structure: Persona Name, Core Identity, Critical Boundary, Mindset & Motives, Voice & Tone (3-4 traits), Operating Principles (3-5), Problem-Solving Framework, Stylistic Guardrails (7 universal + user-specific). Adaptive thinking enabled.

### Carousel Generation (`lib/carousel/`)

**Slide structuring** (`slides-from-post.ts`): Claude Sonnet 4.6 breaks post body into 5-10 slides (heading + body). Voice persona + voice guide injected into system prompt.

**PDF rendering** (`generate-carousel.ts`): `@react-pdf/renderer` generates 1080x1080 multi-page PDF. EB Garamond font (Google Fonts CDN). Brand tokens from globals.css (paper/ink/clay/moss/terracotta). Three slide types: title (ink bg, moss accent), content (paper bg, clay accent), CTA (ink bg, terracotta accent). Logo with paper-colored backdrop on dark slides. No hyphenation.

### Quote Card Generation (`lib/images/generate-quote-card.ts`)

Claude Sonnet 4.6 extracts the strongest line from the post. `@react-pdf/renderer` generates a 1200x627 PDF card in paper or ink variant. Same brand tokens and EB Garamond font.

---

## Background Processing (Inngest)

All functions registered in `app/api/inngest/route.ts`. Inngest SDK reads `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` (aliased from `HILOW_INNGEST_*` prefixed vars set by the Vercel integration).

| Function ID | Event Trigger | What It Does |
|---|---|---|
| `ingest-article` | `source/article.ingest` | Dedup check → Gemini URL analysis → create content_idea |
| `ingest-book` | `source/book.ingest` | Dedup check → Gemini book summary → create content_idea |
| `process-episode` | `source/episode.process` | Fetch transcript (RSS/YouTube/Deepgram) → Gemini analysis → update content_idea |
| `post-first-comment` | `linkedin/first-comment.schedule` | `step.sleep(delayMinutes)` → LinkedIn Comments API → mark posted |
| `generate-carousel` | `content/carousel.generate` | Fetch post → Claude slide structuring → PDF render → store base64 in metadata |
| `generate-image` | `content/image.generate` | Fetch post → Claude quote extraction → PDF quote card → store in metadata |
| `check-repurpose` | `content/repurpose.check` | Query old published posts → check metrics thresholds → create repurpose ideas |

---

## External Service Integrations

| Service | Library/SDK | Env Var | Purpose |
|---|---|---|---|
| Anthropic (Claude) | `@anthropic-ai/sdk` | `ANTHROPIC_API_KEY` | Content generation, voice synthesis, quote/carousel structuring |
| Google AI (Gemini) | `@ai-sdk/google` + `ai` | `GOOGLE_GENERATIVE_AI_API_KEY` | Source material analysis (books, podcasts, articles) |
| Deepgram | `@deepgram/sdk` v4.11.3 | `DEEPGRAM_API_KEY` | Audio transcription (Nova-2, diarization) |
| LinkedIn | Custom fetch | OAuth tokens in DB | Publishing, comments, metrics, document upload |
| Hardcover | Custom GraphQL fetch | `HARDCOVER_API_TOKEN` | User's reading library (books marked as Read) |
| iTunes | Custom fetch | None (public API) | Podcast search |
| YouTube Data API | Custom fetch | `YOUTUBE_API_KEY` | Video search |
| Google Books API | Custom fetch | `GOOGLE_BOOKS_API_KEY` | Book search + cover resolution |
| Inngest | `inngest` SDK | `HILOW_INNGEST_EVENT_KEY`, `HILOW_INNGEST_SIGNING_KEY` | Background job orchestration |
| Supabase | `@supabase/supabase-js` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database (service-role, bypasses RLS) |

---

## Cron Jobs (GitHub Actions)

| Schedule | Workflow | Endpoint |
|---|---|---|
| Mon-Thu 13:05 UTC | `publish-linkedin.yml` | `POST /api/cron/publish-linkedin` |
| Every hour at :05 | `send-reminders.yml` | `POST /api/cron/send-reminders` |

Both use `CRON_SECRET` bearer token for auth. Hit `www.hilowstudio.dev` (not bare domain, to avoid 307 redirect stripping the auth header).

---

## Repurposing Loop

Configurable thresholds in `lib/content-strategy.ts`:
- `min_impressions: 1000`
- `min_engagement_rate: 0.03` (3%)
- `min_age_days: 60`

The `check-repurpose` Inngest function queries published posts exceeding thresholds, creates `content_idea` entries with `source: "repurpose"` containing the original post body + metrics. These appear in My Sources under the Repurpose tab and can be used to generate fresh content from a new angle.

---

## Voice Guardrails (Anti-Pattern Protocol)

Applied universally to all AI-generated content:

1. **Banned words:** delve, explore, navigate, foster, enhance, leverage, transformative, robust, comprehensive, pivotal, dynamic, intricacies, nuances
2. **Syntactic burstiness:** varied sentence length, contractions, broken rhythm
3. **Structural asymmetry:** no formulaic architecture, no summary conclusions
4. **Discourse:** strong point of view, no prompt echoing
5. **Flow:** no AI transitions (Furthermore, Moreover, etc.)
6. **No contrastive framing:** all "It's not X, it's Y" variants banned with examples
7. **Punctuation:** em dashes absolutely banned
8. **Human-only hooks:** Story and Vulnerable hooks blocked from AI generation

The voice check (`lib/voice-persona.ts: checkVoiceViolations()`) runs client-side in the editor, flagging violations in real time before publishing.
