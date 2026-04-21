import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAuthenticated as isPlatformAdmin } from "@/lib/admin-auth";
import { loadUserMemberships, type OpsUser } from "./scope";

const COOKIE_NAME = "hilow_ops_session";
const JWT_EXPIRY = "30d";

function getSecret() {
  const secret = process.env.OPS_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("Missing OPS_JWT_SECRET env var");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function signUserToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

export async function verifyUserToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await signUserToken(userId);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

async function loadOpsUser(userId: string): Promise<OpsUser | null> {
  const db = getSupabase();
  const { data } = await db
    .from("ops_users")
    .select("id, email, name")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;
  const row = data as { id: string; email: string; name: string | null };

  const memberships = await loadUserMemberships(userId);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    memberships,
    isPlatformAdmin: false,
  };
}

/**
 * Resolve the calling user from cookies.
 * - If an ops session cookie is present, returns that ops user.
 * - If the legacy admin cookie is present (Adam), returns a synthetic
 *   platform-admin user linked to Adam's default workspace.
 */
export async function getCurrentUser(): Promise<OpsUser | null> {
  const jar = await cookies();
  const opsToken = jar.get(COOKIE_NAME)?.value;

  if (opsToken) {
    const userId = await verifyUserToken(opsToken);
    if (userId) {
      const user = await loadOpsUser(userId);
      if (user) return user;
    }
  }

  if (await isPlatformAdmin()) {
    const db = getSupabase();
    const { data } = await db
      .from("ops_workspaces")
      .select("id")
      .eq("slug", "adam")
      .maybeSingle();

    const workspaceId = (data as { id: string } | null)?.id ?? null;
    const memberships: OpsUser["memberships"] = workspaceId
      ? [{ scope: "workspace", scopeId: workspaceId, role: "owner" }]
      : [];

    return {
      id: "platform-admin",
      email: process.env.ADMIN_EMAIL ?? "adam@hilowstudio.dev",
      name: "Adam",
      memberships,
      isPlatformAdmin: true,
    };
  }

  return null;
}

export async function getCurrentUserFromRequest(
  request: NextRequest,
): Promise<OpsUser | null> {
  const opsToken = request.cookies.get(COOKIE_NAME)?.value;
  if (opsToken) {
    const userId = await verifyUserToken(opsToken);
    if (userId) {
      const user = await loadOpsUser(userId);
      if (user) return user;
    }
  }

  const adminToken = request.cookies.get("hilow_admin")?.value;
  if (adminToken) {
    try {
      await jwtVerify(
        adminToken,
        new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? ""),
      );
      const db = getSupabase();
      const { data } = await db
        .from("ops_workspaces")
        .select("id")
        .eq("slug", "adam")
        .maybeSingle();
      const workspaceId = (data as { id: string } | null)?.id ?? null;
      const memberships: OpsUser["memberships"] = workspaceId
        ? [{ scope: "workspace", scopeId: workspaceId, role: "owner" }]
        : [];
      return {
        id: "platform-admin",
        email: process.env.ADMIN_EMAIL ?? "adam@hilowstudio.dev",
        name: "Adam",
        memberships,
        isPlatformAdmin: true,
      };
    } catch {
      // fall through
    }
  }

  return null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string | null;
}): Promise<{ id: string; email: string }> {
  const db = getSupabase();
  const passwordHash = await hashPassword(input.password);
  const { data, error } = await db
    .from("ops_users")
    .insert({
      email: input.email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: input.name ?? null,
    })
    .select("id, email")
    .single();

  if (error) throw error;
  return data as { id: string; email: string };
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ id: string } | null> {
  const db = getSupabase();
  const { data } = await db
    .from("ops_users")
    .select("id, password_hash")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (!data) return null;
  const row = data as { id: string; password_hash: string };
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id };
}

export function generateInviteToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export { COOKIE_NAME };
