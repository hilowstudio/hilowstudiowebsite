import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { resolveContentPostScope } from "@/lib/ops/content";
import { recordEngagementEvents } from "@/lib/ops/network/engagement";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const scope = await resolveContentPostScope(id);
  if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      scope.clientId,
      scope.workspaceId,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("content_posts")
    .select("id, linkedin_post_id, status")
    .eq("id", id)
    .maybeSingle();
  const post = data as {
    id: string;
    linkedin_post_id: string | null;
    status: string;
  } | null;
  if (!post?.linkedin_post_id) {
    return NextResponse.json(
      { error: "Post is not published to LinkedIn yet" },
      { status: 400 },
    );
  }

  try {
    const result = await recordEngagementEvents({
      clientId: scope.clientId,
      postId: post.id,
      postUrn: post.linkedin_post_id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 502 },
    );
  }
}
