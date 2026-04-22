import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { rebuildWarmProspectsForWorkspace } from "@/lib/ops/network/warm-prospects";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (
    !hasWorkspaceAccess(
      user.memberships,
      id,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { top } = await rebuildWarmProspectsForWorkspace(id);
  return NextResponse.json({ top: top.length });
}
