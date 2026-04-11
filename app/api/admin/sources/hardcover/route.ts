import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { fetchReadBooks } from "@/lib/sources/hardcover";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit") || "20");
  const offset = Number(request.nextUrl.searchParams.get("offset") || "0");

  try {
    const books = await fetchReadBooks(limit, offset);
    return NextResponse.json(books);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
