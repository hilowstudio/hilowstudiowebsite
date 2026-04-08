import { supabase } from "@/lib/supabase";

const LINKEDIN_UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

export class LinkedInNotConnectedError extends Error {
  constructor() {
    super("LinkedIn is not connected. Visit /admin to connect your account.");
    this.name = "LinkedInNotConnectedError";
  }
}

export class LinkedInTokenExpiredError extends Error {
  constructor() {
    super("LinkedIn access token has expired. Reconnect at /admin.");
    this.name = "LinkedInTokenExpiredError";
  }
}

interface LinkedInConnection {
  id: string;
  person_urn: string;
  access_token: string;
  expires_at: string;
}

async function getActiveConnection(): Promise<LinkedInConnection> {
  const { data, error } = await supabase
    .from("linkedin_connections")
    .select("id, person_urn, access_token, expires_at")
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new LinkedInNotConnectedError();

  if (new Date(data.expires_at) <= new Date()) {
    await supabase
      .from("linkedin_connections")
      .update({ status: "needs_reauth" })
      .eq("id", data.id);
    throw new LinkedInTokenExpiredError();
  }

  return data as LinkedInConnection;
}

async function markNeedsReauth(connectionId: string) {
  await supabase
    .from("linkedin_connections")
    .update({ status: "needs_reauth" })
    .eq("id", connectionId);
}

interface LinkedInPostResult {
  id: string;
}

export async function publishTextPost(text: string): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection();

  const res = await fetch(LINKEDIN_UGC_POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: connection.person_urn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) {
      await markNeedsReauth(connection.id);
    }
    throw new Error(`LinkedIn API error (${res.status}): ${body}`);
  }

  // LinkedIn returns the newly created post ID in the x-restli-id header
  const postId = res.headers.get("x-restli-id") || "";

  return { id: postId };
}
