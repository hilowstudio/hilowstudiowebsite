const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string | null;
  publishedAt: string | null;
}

export async function searchYouTubeVideos(
  query: string
): Promise<YouTubeSearchResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY env var");

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "10",
    key,
  });

  const res = await fetch(`${YT_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${body}`);
  }

  const data = await res.json();

  return (data.items || []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails?: { medium?: { url: string } };
        publishedAt?: string;
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || null,
      publishedAt: item.snippet.publishedAt || null,
    })
  );
}
