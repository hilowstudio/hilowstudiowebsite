const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";

export interface HardcoverBook {
  id: number;
  title: string;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  rating: number | null;
  lastReadDate: string | null;
}

export interface HardcoverResult {
  books: HardcoverBook[];
  total: number;
}

const READ_BOOKS_QUERY = `
  query ReadBooks($limit: Int!, $offset: Int!) {
    me {
      user_books(
        where: { status_id: { _eq: 3 } }
        order_by: [{ last_read_date: desc_nulls_last }, { id: desc }]
        limit: $limit
        offset: $offset
      ) {
        id
        rating
        last_read_date
        book {
          id
          title
          description
          pages
          image { url }
          contributions { author { name } }
          editions(limit: 1) { isbn_13 isbn_10 }
        }
      }
      user_books_aggregate(where: { status_id: { _eq: 3 } }) {
        aggregate { count }
      }
    }
  }
`;

interface HardcoverApiResponse {
  data?: {
    me?: {
      user_books?: {
        id: number;
        rating: number | null;
        last_read_date: string | null;
        book: {
          id: number;
          title: string;
          description: string | null;
          pages: number | null;
          image: { url: string } | null;
          contributions: { author: { name: string } }[];
          editions: { isbn_13: string | null; isbn_10: string | null }[];
        };
      }[];
      user_books_aggregate?: {
        aggregate: { count: number };
      };
    }[];
  };
  errors?: { message: string }[];
}

/** Try Open Library cover by ISBN, then fall back to Google Books thumbnail. */
async function resolveCover(
  title: string,
  authors: string[],
  isbn13: string | null,
  isbn10: string | null
): Promise<string | null> {
  // Open Library: free, no key, fast
  const isbn = isbn13 || isbn10;
  if (isbn) {
    const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
    try {
      const res = await fetch(olUrl, { method: "HEAD", redirect: "follow" });
      if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
        return olUrl;
      }
    } catch {
      // Fall through
    }
  }

  // Google Books: search by title+author, grab thumbnail
  try {
    const q = encodeURIComponent(`${title} ${authors[0] || ""}`);
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1${
        process.env.GOOGLE_BOOKS_API_KEY
          ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}`
          : ""
      }`
    );
    if (res.ok) {
      const data = await res.json();
      const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (thumb) return thumb.replace("http:", "https:");
    }
  } catch {
    // Give up
  }

  return null;
}

export async function fetchReadBooks(
  limit = 10,
  offset = 0
): Promise<HardcoverResult> {
  const token = process.env.HARDCOVER_API_TOKEN;
  if (!token) throw new Error("Missing HARDCOVER_API_TOKEN env var");

  const res = await fetch(HARDCOVER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: READ_BOOKS_QUERY,
      variables: { limit, offset },
    }),
  });

  if (!res.ok) {
    throw new Error(`Hardcover API error: ${res.status} ${res.statusText}`);
  }

  const json: HardcoverApiResponse = await res.json();

  if (json.errors?.length) {
    throw new Error(`Hardcover GraphQL error: ${json.errors[0].message}`);
  }

  const me = json.data?.me?.[0];
  const userBooks = me?.user_books || [];
  const total = me?.user_books_aggregate?.aggregate.count || 0;

  const books: HardcoverBook[] = userBooks.map((ub) => ({
    id: ub.book.id,
    title: ub.book.title,
    authors: ub.book.contributions.map((c) => c.author.name),
    description: ub.book.description,
    coverUrl: ub.book.image?.url || null,
    rating: ub.rating,
    lastReadDate: ub.last_read_date,
  }));

  // Resolve missing covers in parallel via Open Library / Google Books
  const missingIndexes = books
    .map((b, i) => (!b.coverUrl ? i : -1))
    .filter((i) => i >= 0);

  if (missingIndexes.length > 0) {
    const resolved = await Promise.all(
      missingIndexes.map((i) => {
        const ub = userBooks[i];
        const isbn13 = ub.book.editions?.[0]?.isbn_13 || null;
        const isbn10 = ub.book.editions?.[0]?.isbn_10 || null;
        return resolveCover(books[i].title, books[i].authors, isbn13, isbn10);
      })
    );
    for (let j = 0; j < missingIndexes.length; j++) {
      if (resolved[j]) books[missingIndexes[j]].coverUrl = resolved[j];
    }
  }

  return { total, books };
}
