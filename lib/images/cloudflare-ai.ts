const CF_AI_URL = "https://api.cloudflare.com/client/v4/accounts";

export async function generateWithFlux(prompt: string): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_AI_API_TOKEN;

  if (!accountId || !token) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_AI_API_TOKEN env vars"
    );
  }

  const res = await fetch(
    `${CF_AI_URL}/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudflare AI error (${res.status}): ${body}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
}
