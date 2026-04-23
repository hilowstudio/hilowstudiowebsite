/**
 * URL → markdown extraction for LLM grounding. Used by `generate-post.ts`
 * when a sourceUrl is provided and we're routing to a non-Anthropic provider
 * (Anthropic BYOK gets the native web_fetch tool instead).
 *
 * Primary: Jina Reader (`https://r.jina.ai/{url}`). Zero-config, Apache-2.0,
 * generous free tier. Optional JINA_API_KEY raises rate limits.
 *
 * Upgrade: if FIRECRAWL_API_KEY is set, use Firecrawl for JS-heavy pages.
 */

const MIN_CONTENT_CHARS = 200;

export class UrlFetchEmptyError extends Error {
  constructor(url: string) {
    super(
      `Couldn't extract meaningful content from ${url}. The page may be empty, behind a paywall, or require JavaScript.`,
    );
    this.name = "UrlFetchEmptyError";
  }
}

export type UrlFetchResult = {
  content: string;
  source: "jina" | "firecrawl";
  url: string;
};

async function fetchViaJina(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const headers: Record<string, string> = { Accept: "text/plain" };
  if (process.env.JINA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
  }
  const res = await fetch(jinaUrl, { headers });
  if (!res.ok) {
    throw new Error(`Jina Reader ${res.status}: ${await res.text()}`);
  }
  return (await res.text()).trim();
}

async function fetchViaFirecrawl(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not set");
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Firecrawl ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    data?: { markdown?: string };
  };
  return (data.data?.markdown ?? "").trim();
}

export async function fetchUrlAsMarkdown(url: string): Promise<UrlFetchResult> {
  const preferFirecrawl = Boolean(process.env.FIRECRAWL_API_KEY);
  const source: UrlFetchResult["source"] = preferFirecrawl ? "firecrawl" : "jina";

  const content = preferFirecrawl
    ? await fetchViaFirecrawl(url)
    : await fetchViaJina(url);

  if (content.length < MIN_CONTENT_CHARS) {
    throw new UrlFetchEmptyError(url);
  }

  return { content, source, url };
}
