import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeVideos } from "@/lib/sources/youtube-search";
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
  try {
    const results = await searchYouTubeVideos(q);
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
