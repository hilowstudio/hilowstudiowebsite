import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST_SUFFIXES = [
  "hilowstudio.dev",
  "vercel.app",
  "localhost",
];

function isPrimaryHost(host: string): boolean {
  const bare = host.split(":")[0];
  return PRIMARY_HOST_SUFFIXES.some(
    (s) => bare === s || bare.endsWith(`.${s}`),
  );
}

async function lookupWorkspaceSlug(
  host: string,
): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/ops_workspaces?custom_domain=eq.${encodeURIComponent(host)}&select=slug,domain_verified_at&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as {
    slug: string;
    domain_verified_at: string | null;
  }[];
  const row = rows[0];
  if (!row) return null;
  if (!row.domain_verified_at) return null;
  return row.slug;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!host || isPrimaryHost(host)) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/w/") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const slug = await lookupWorkspaceSlug(host);
  if (!slug) {
    return NextResponse.next();
  }

  const rewritten = request.nextUrl.clone();
  rewritten.pathname = pathname === "/"
    ? `/w/${slug}`
    : `/w/${slug}${pathname}`;
  return NextResponse.rewrite(rewritten);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
