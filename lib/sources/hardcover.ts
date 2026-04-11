const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";

export interface HardcoverBook {
  id: number;
  title: string;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  rating: number | null;
}

// status_id values: 1=Want to Read, 2=Currently Reading, 3=Read, 4=Did Not Finish, 5=Paused
const READ_BOOKS_QUERY = `
  query ReadBooks($limit: Int!, $offset: Int!) {
    me {
      user_books(
        where: { status_id: { _eq: 3 } }
        order_by: { updated_at: desc }
        limit: $limit
        offset: $offset
      ) {
        id
        rating
        review
        book {
          id
          title
          description
          pages
          image { url }
          contributions { author { name } }
          taggings { tag { tag } }
        }
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
        review: string | null;
        book: {
          id: number;
          title: string;
          description: string | null;
          pages: number | null;
          image: { url: string } | null;
          contributions: { author: { name: string } }[];
          taggings: { tag: { tag: string } }[];
        };
      }[];
    }[];
  };
  errors?: { message: string }[];
}

export async function fetchReadBooks(
  limit = 20,
  offset = 0
): Promise<HardcoverBook[]> {
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

  const userBooks = json.data?.me?.[0]?.user_books || [];

  return userBooks.map((ub) => ({
    id: ub.book.id,
    title: ub.book.title,
    authors: ub.book.contributions.map((c) => c.author.name),
    description: ub.book.description,
    coverUrl: ub.book.image?.url || null,
    rating: ub.rating,
  }));
}
