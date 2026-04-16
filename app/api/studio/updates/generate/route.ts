import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { draftAndStoreUpdate } from "@/lib/studio/client-update";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    project_id?: string;
    since?: string;
  };

  if (!body.project_id) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 });
  }

  const since = body.since ? new Date(body.since) : undefined;

  try {
    const result = await draftAndStoreUpdate(body.project_id, "manual", {
      since,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Unable to generate draft" },
        { status: 500 },
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
