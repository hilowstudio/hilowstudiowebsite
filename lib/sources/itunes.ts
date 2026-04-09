export interface PodcastSearchResult {
  title: string;
  author: string;
  image: string | null;
  feedUrl: string;
}

export async function searchPodcasts(
  term: string
): Promise<PodcastSearchResult[]> {
  if (!term.trim()) return [];

  const params = new URLSearchParams({
    term,
    media: "podcast",
    entity: "podcast",
    limit: "15",
  });

  const res = await fetch(
    `https://itunes.apple.com/search?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(`iTunes API error: ${res.statusText}`);
  }

  const data = await res.json();

  return (data.results || [])
    .map((item: Record<string, unknown>) => ({
      title: item.collectionName as string,
      author: item.artistName as string,
      image:
        (item.artworkUrl600 as string) ||
        (item.artworkUrl100 as string) ||
        null,
      feedUrl: item.feedUrl as string,
    }))
    .filter((r: PodcastSearchResult) => r.feedUrl);
}
