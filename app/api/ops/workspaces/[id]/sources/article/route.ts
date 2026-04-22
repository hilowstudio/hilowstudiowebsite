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

  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  await inngest.send({
    name: "source/article.ingest",
    data: { url, workspaceId: id },
  });

  return NextResponse.json({ queued: true, url }, { status: 202 });
}
