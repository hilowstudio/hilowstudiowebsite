export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchReadBooks } from "@/lib/sources/hardcover";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const limit = Number(request.nextUrl.searchParams.get("limit") || "10");
  const offset = Number(request.nextUrl.searchParams.get("offset") || "0");

  try {
    const result = await fetchReadBooks(limit, offset);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
