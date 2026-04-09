import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { searchGoogleBooks } from "@/lib/sources/google-books";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 });
  }

  const results = await searchGoogleBooks(q);
  return NextResponse.json(results);
}
