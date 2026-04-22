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

async function getActiveConnection(
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<LinkedInConnection> {
  let query = supabase
    .from("linkedin_connections")
    .select("id, person_urn, access_token, expires_at")
    .eq("status", "active")
    .limit(1);

  if (clientId) {
    query = query.eq("client_id", clientId);
  } else if (workspaceId) {
    query = query.eq("workspace_id", workspaceId).is("client_id", null);
  }

  const { data, error } = await query.maybeSingle();

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
  text: string,
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection(clientId, workspaceId);

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
  title: string,
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection(clientId, workspaceId);

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

export async function publishImagePost(
  text: string,
  imageUrn: string,
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<LinkedInPostResult> {
  const connection = await getActiveConnection(clientId, workspaceId);

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
          id: imageUrn,
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

// ─── Image upload (Images API, v2 assets) ─────────────────

export async function uploadImage(
  imageBuffer: Buffer,
  contentType: string = "image/png",
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<string> {
  const connection = await getActiveConnection(clientId, workspaceId);

  // Register upload via v2 assets API (works with w_member_social)
  const initRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: connection.person_urn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    }
  );

  if (!initRes.ok) {
    const body = await initRes.text();
    if (initRes.status === 401) await markNeedsReauth(connection.id);
    throw new Error(`LinkedIn image init error (${initRes.status}): ${body}`);
  }

  const initData = (await initRes.json()) as {
    value: {
      uploadMechanism: {
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
          uploadUrl: string;
        };
      };
      asset: string;
    };
  };

  const uploadUrl =
    initData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const assetUrn = initData.value.asset;

  // Upload the image binary
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(
      `LinkedIn image upload error (${uploadRes.status}): ${body}`
    );
  }

  return assetUrn;
}

// ─── Document upload (Documents API) ──────────────────────

export async function uploadDocument(
  pdfBuffer: Buffer,
  _title: string,
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<string> {
  const connection = await getActiveConnection(clientId, workspaceId);

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
  commentText: string,
  clientId?: string | null,
  workspaceId?: string | null,
): Promise<string> {
  const connection = await getActiveConnection(clientId, workspaceId);

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
