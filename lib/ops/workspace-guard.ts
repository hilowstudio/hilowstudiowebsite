import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

export type GuardResult =
  | { ok: true; user: Awaited<ReturnType<typeof getCurrentUserFromRequest>> }
  | { ok: false; response: NextResponse };

/** Require staff access (or platform-admin) for a workspace. */
export async function requireWorkspace(
  request: NextRequest,
  workspaceId: string,
  level: "staff" | "owner" = "staff",
): Promise<GuardResult> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!hasWorkspaceAccess(user.memberships, workspaceId, level, user.isPlatformAdmin)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
