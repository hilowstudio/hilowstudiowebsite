import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const book = await request.json();
  if (!book.title) {
    return NextResponse.json({ error: "Book title is required" }, { status: 400 });
  }

  await inngest.send({
    name: "source/book.ingest",
    data: {
      title: book.title,
      authors: book.authors || [],
      description: book.description || undefined,
      publisher: book.publisher || undefined,
      publishedDate: book.publishedDate || undefined,
      pageCount: book.pageCount || undefined,
      coverUrl: book.coverUrl || undefined,
      isbn: book.isbn || undefined,
      categories: book.categories || undefined,
    },
  });

  return NextResponse.json({ queued: true, title: book.title }, { status: 202 });
}
