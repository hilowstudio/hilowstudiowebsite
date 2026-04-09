import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { parseFeed } from "@/lib/sources/rss";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedUrl = request.nextUrl.searchParams.get("url");
  if (!feedUrl) {
    return NextResponse.json(
      { error: "Query parameter url is required" },
      { status: 400 }
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
