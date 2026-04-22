import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

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
      workspaceId: id,
    },
  });

  return NextResponse.json({ queued: true, title: book.title }, { status: 202 });
}
