const VERCEL_API = "https://api.vercel.com";

type VerifyResult = {
  name: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string; reason: string }[];
  error?: { code: string; message: string };
};

function vercelAuthHeaders(): Record<string, string> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error("VERCEL_API_TOKEN is not configured");
  }
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function teamQuery(): string {
  const team = process.env.VERCEL_TEAM_ID;
  return team ? `?teamId=${encodeURIComponent(team)}` : "";
}

function projectId(): string {
  const id = process.env.VERCEL_PROJECT_ID;
  if (!id) throw new Error("VERCEL_PROJECT_ID is not configured");
  return id;
}

export async function addDomainToVercel(domain: string): Promise<VerifyResult> {
  const url = `${VERCEL_API}/v10/projects/${projectId()}/domains${teamQuery()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: vercelAuthHeaders(),
    body: JSON.stringify({ name: domain }),
  });
  const payload = (await res.json()) as VerifyResult;
  if (!res.ok && !payload.error) {
    throw new Error(`Vercel API error ${res.status}`);
  }
  return payload;
}

export async function verifyDomainOnVercel(
  domain: string,
): Promise<VerifyResult> {
  const url = `${VERCEL_API}/v10/projects/${projectId()}/domains/${encodeURIComponent(domain)}/verify${teamQuery()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: vercelAuthHeaders(),
  });
  const payload = (await res.json()) as VerifyResult;
  return payload;
}

export async function getDomainStatus(
  domain: string,
): Promise<VerifyResult | null> {
  const url = `${VERCEL_API}/v10/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`;
  const res = await fetch(url, { headers: vercelAuthHeaders() });
  if (res.status === 404) return null;
  const payload = (await res.json()) as VerifyResult;
  return payload;
}

export async function removeDomainFromVercel(
  domain: string,
): Promise<boolean> {
  const url = `${VERCEL_API}/v10/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: vercelAuthHeaders(),
  });
  return res.ok || res.status === 404;
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*/, "");
}
