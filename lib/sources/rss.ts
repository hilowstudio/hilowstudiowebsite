import Parser from "rss-parser";

export interface FeedEpisode {
  title: string;
  guid: string;
  audioUrl: string | null;
  description: string | null;
  publishedAt: string | null;
  transcriptUrl: string | null;
}

export interface ParsedFeed {
  title: string;
  description: string | null;
  image: string | null;
  episodes: FeedEpisode[];
}

const parser = new Parser({
  customFields: {
    item: [["podcast:transcript", "transcript"]],
  },
});

export async function parseFeed(feedUrl: string): Promise<ParsedFeed> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "HiLow/1.0 (compatible; RSS Reader)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch feed: ${res.statusText}`);

  const xml = await res.text();
  const feed = await parser.parseString(xml);

  const episodes: FeedEpisode[] = (feed.items || [])
    .slice(0, 50) // cap at 50 most recent
    .map((item) => ({
      title: item.title || "Untitled",
      guid: item.guid || item.link || item.title || "",
      audioUrl: item.enclosure?.url || null,
      description: item.contentSnippet || item.content || null,
      publishedAt: item.pubDate || item.isoDate || null,
      transcriptUrl:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).transcript
          ? String((item as any).transcript)
          : null,
    }))
    .filter((ep) => ep.guid);

  return {
    title: feed.title || "Unknown Feed",
    description: feed.description || null,
    image: feed.image?.url || null,
    episodes,
  };
}
