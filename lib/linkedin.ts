const LINKEDIN_API = "https://api.linkedin.com/rest";

interface LinkedInPostResult {
  id: string;
}

export async function publishTextPost(text: string): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (!accessToken || !personUrn) {
    throw new Error("Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN env vars");
  }

  const res = await fetch(`${LINKEDIN_API}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: personUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn API error (${res.status}): ${body}`);
  }

  // LinkedIn returns the post ID in the x-restli-id header
  const postId = res.headers.get("x-restli-id") || "";

  return { id: postId };
}
