import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const STATE_COOKIE = "li_oauth_state";

function errorRedirect(appUrl: string, reason: string) {
  const res = NextResponse.redirect(
    `${appUrl}/admin?linkedin=error&reason=${encodeURIComponent(reason)}`
  );
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!clientId || !clientSecret || !appUrl) {
    return NextResponse.json(
      { error: "Missing LinkedIn OAuth env vars" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return errorRedirect(appUrl, error);
  }
  if (!code || !state) {
    return errorRedirect(appUrl, "missing_code_or_state");
  }

  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  if (!cookieState || cookieState !== state) {
    return errorRedirect(appUrl, "state_mismatch");
  }

  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  // Exchange code for access token
  const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("LinkedIn token exchange failed:", tokenRes.status, body);
    return errorRedirect(appUrl, "token_exchange_failed");
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope?: string;
  };

  // Fetch OIDC userinfo to get the person URN and profile data
  const userRes = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    const body = await userRes.text();
    console.error("LinkedIn userinfo failed:", userRes.status, body);
    return errorRedirect(appUrl, "userinfo_failed");
  }

  const userInfo = (await userRes.json()) as {
    sub: string;
    name?: string;
    email?: string;
  };

  const personUrn = `urn:li:person:${userInfo.sub}`;
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  // Revoke any existing active connection
  const { error: revokeErr } = await supabase
    .from("linkedin_connections")
    .update({ status: "revoked" })
    .eq("status", "active");

  if (revokeErr) {
    console.error("Failed to revoke existing connection:", revokeErr);
    return errorRedirect(appUrl, "db_revoke_failed");
  }

  // Insert new active connection
  const { error: insertErr } = await supabase.from("linkedin_connections").insert({
    person_urn: personUrn,
    name: userInfo.name ?? null,
    email: userInfo.email ?? null,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at: expiresAt,
    scope: tokenData.scope ?? "openid profile email w_member_social",
    status: "active",
  });

  if (insertErr) {
    console.error("Failed to insert linkedin_connection:", insertErr);
    return errorRedirect(appUrl, "db_insert_failed");
  }

  const response = NextResponse.redirect(`${appUrl}/admin?linkedin=connected`);
  response.cookies.delete(STATE_COOKIE);
  return response;
}
