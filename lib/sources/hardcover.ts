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
        };
      }[];
      user_books_aggregate?: {
        aggregate: { count: number };
      };
    }[];
  };
  errors?: { message: string }[];
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

  return {
    total,
    books: userBooks.map((ub) => ({
      id: ub.book.id,
      title: ub.book.title,
      authors: ub.book.contributions.map((c) => c.author.name),
      description: ub.book.description,
      coverUrl: ub.book.image?.url || null,
      rating: ub.rating,
      lastReadDate: ub.last_read_date,
    })),
  };
}
