const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

export interface BookMetadata {
  title: string;
  authors: string[];
  description: string | null;
  publisher: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  coverUrl: string | null;
  isbn: string | null;
  categories: string[];
}

export async function searchGoogleBooks(
  query: string
): Promise<BookMetadata[]> {
  if (!query.trim()) return [];

  const url = new URL(GOOGLE_BOOKS_API);
  url.searchParams.append("q", query);
  url.searchParams.append("maxResults", "10");
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) url.searchParams.append("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("Google Books API error:", res.statusText);
    return [];
  }

  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item: Record<string, unknown>) => {
    const info = item.volumeInfo as Record<string, unknown>;
    const identifiers = info.industryIdentifiers as
      | { type: string; identifier: string }[]
      | undefined;
    const isbn =
      identifiers?.find((id) => id.type === "ISBN_13")?.identifier ||
      identifiers?.find((id) => id.type === "ISBN_10")?.identifier ||
      null;
    const imageLinks = info.imageLinks as
      | { thumbnail?: string }
      | undefined;

    return {
      title: (info.title as string) || "Untitled",
      authors: (info.authors as string[]) || [],
      description: (info.description as string) || null,
      publisher: (info.publisher as string) || null,
      publishedDate: (info.publishedDate as string) || null,
      pageCount: (info.pageCount as number) || null,
      coverUrl: imageLinks?.thumbnail?.replace("http:", "https:") || null,
      isbn,
      categories: (info.categories as string[]) || [],
    };
  });
}
