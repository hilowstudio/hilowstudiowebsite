import { supabase } from "@/lib/supabase";

const LINKEDIN_API = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = "202603";

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

function linkedInHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LINKEDIN_VERSION,
  };
}

// ─── Post creation (Posts API) ────────────────────────────

export interface LinkedInPostResult {
  id: string;
}

export async function publishTextPost(
  text: string
): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection();

  const res = await fetch(`${LINKEDIN_API}/posts`, {
    method: "POST",
    headers: linkedInHeaders(connection.access_token),
    body: JSON.stringify({
      author: connection.person_urn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) await markNeedsReauth(connection.id);
    throw new Error(`LinkedIn API error (${res.status}): ${body}`);
  }

  return { id: res.headers.get("x-restli-id") || "" };
}

export async function publishDocumentPost(
  text: string,
  documentUrn: string,
  title: string
): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection();

  const res = await fetch(`${LINKEDIN_API}/posts`, {
    method: "POST",
    headers: linkedInHeaders(connection.access_token),
    body: JSON.stringify({
      author: connection.person_urn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          title,
          id: documentUrn,
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) await markNeedsReauth(connection.id);
    throw new Error(`LinkedIn API error (${res.status}): ${body}`);
  }

  return { id: res.headers.get("x-restli-id") || "" };
}

// ─── Document upload (Documents API) ──────────────────────

export async function uploadDocument(
  pdfBuffer: Buffer,
  title: string
): Promise<string> {
  const connection = await getActiveConnection();

  // Step 1: Initialize upload
  const initRes = await fetch(
    `${LINKEDIN_API}/documents?action=initializeUpload`,
    {
      method: "POST",
      headers: linkedInHeaders(connection.access_token),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: connection.person_urn,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const body = await initRes.text();
    if (initRes.status === 401) await markNeedsReauth(connection.id);
    throw new Error(
      `LinkedIn document init error (${initRes.status}): ${body}`
    );
  }

  const initData = (await initRes.json()) as {
    value: { uploadUrl: string; document: string };
  };
  const { uploadUrl, document: documentUrn } = initData.value;

  // Step 2: Upload the PDF binary
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": "application/pdf",
    },
    body: new Uint8Array(pdfBuffer),
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(
      `LinkedIn document upload error (${uploadRes.status}): ${body}`
    );
  }

  return documentUrn;
}

// ─── Comments (Social Actions API) ────────────────────────

export async function postComment(
  postUrn: string,
  commentText: string
): Promise<string> {
  const connection = await getActiveConnection();

  const res = await fetch(
    `${LINKEDIN_API}/socialActions/${encodeURIComponent(postUrn)}/comments`,
    {
      method: "POST",
      headers: linkedInHeaders(connection.access_token),
      body: JSON.stringify({
        actor: connection.person_urn,
        object: postUrn,
        message: { text: commentText },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) await markNeedsReauth(connection.id);
    throw new Error(`LinkedIn comment error (${res.status}): ${body}`);
  }

  return res.headers.get("x-restli-id") || "";
}
