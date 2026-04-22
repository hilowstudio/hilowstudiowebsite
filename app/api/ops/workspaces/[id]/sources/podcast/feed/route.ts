import { NextRequest, NextResponse } from "next/server";
import { parseFeed } from "@/lib/sources/rss";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const feedUrl = request.nextUrl.searchParams.get("url");
  if (!feedUrl) {
    return NextResponse.json(
      { error: "Query parameter url is required" },
      { status: 400 },
    );
  }

  try {
    const feed = await parseFeed(feedUrl);
    return NextResponse.json(feed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse feed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
