import { NextRequest, NextResponse } from "next/server";
import { searchGoogleBooks } from "@/lib/sources/google-books";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 },
    );
  }
  const results = await searchGoogleBooks(q);
  return NextResponse.json(results);
}
