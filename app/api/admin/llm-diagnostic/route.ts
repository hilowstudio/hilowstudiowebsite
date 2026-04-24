import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { pillarsSchema } from "@/lib/ai/schemas";

/**
 * Admin-only diagnostic: compares hi-low's configured OpenRouter model slugs
 * against the live model catalog that OpenRouter exposes for the current
 * OPENROUTER_API_KEY. Surfaces slug mismatches that would cause
 * "No endpoints available matching your guardrail restrictions" errors.
 *
 * GET /api/admin/llm-diagnostic
 */

const HI_LOW_SLUGS = [
  "qwen/qwen3.6-plus",
  "z-ai/glm-5.1",
  "moonshotai/kimi-k2.6",
  "minimax/minimax-m2.7",
  "google/gemma-4-26b-a4b-it",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it",
  "google/gemma-4-31b-it:free",
];

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not set on platform" },
      { status: 500 },
    );
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      {
        error: `OpenRouter /models returned ${res.status}`,
        body: await res.text(),
      },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    data: { id: string; name?: string; context_length?: number }[];
  };
  const liveSlugs = new Set(data.data.map((m) => m.id));

  const vendorMatch = (slug: string) => {
    const vendor = slug.split("/")[0];
    return data.data
      .filter((m) => m.id.startsWith(`${vendor}/`))
      .map((m) => ({ id: m.id, name: m.name ?? null }));
  };

  const report = HI_LOW_SLUGS.map((configured) => ({
    configured,
    found: liveSlugs.has(configured),
    same_vendor_matches: liveSlugs.has(configured)
      ? undefined
      : vendorMatch(configured)
          .filter((m) => {
            const lastSegment = configured.split("/")[1];
            return m.id
              .toLowerCase()
              .includes(lastSegment.split("-")[0].toLowerCase());
          })
          .slice(0, 10),
  }));

  const missingCount = report.filter((r) => !r.found).length;

  // Four raw-fetch probes to isolate which payload attribute trips the
  // OpenRouter filter from Vercel's outbound IP. Each uses identical
  // headers — only the body differs.
  async function probe(label: string, body: Record<string, unknown>) {
    try {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const text = await res.text();
      return {
        label,
        status: res.status,
        body_preview: text.slice(0, 200),
        cfRay: res.headers.get("cf-ray"),
        bytes: JSON.stringify(body).length,
      };
    } catch (err) {
      return {
        label,
        status: -1,
        body_preview: err instanceof Error ? err.message : String(err),
        cfRay: null,
        bytes: 0,
      };
    }
  }

  const bigSystem = "You are a helpful assistant.\n\n".repeat(500); // ~15KB

  const probes = [
    await probe("minimal_user_only", {
      model: "moonshotai/kimi-k2.6",
      messages: [{ role: "user", content: "hello" }],
    }),
    await probe("short_system_plus_user", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "hello" },
      ],
    }),
    await probe("big_system_plain_string", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        { role: "system", content: bigSystem },
        { role: "user", content: "hello" },
      ],
    }),
    await probe("big_system_content_parts", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        {
          role: "system",
          content: [{ type: "text", text: bigSystem }],
        },
        { role: "user", content: "hello" },
      ],
    }),
    await probe("real_persona_system", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        { role: "system", content: PERSONA_SYSTEM_PROMPT },
        { role: "user", content: "hello" },
      ],
    }),
    // Persona + pillar wizard instructions (no schema code block).
    await probe("persona_plus_wizard_prompt", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        {
          role: "system",
          content:
            PERSONA_SYSTEM_PROMPT +
            `\n\n---\n\nYou are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars.\n\n## Output format\nRespond with ONLY a JSON object.`,
        },
        { role: "user", content: "hello" },
      ],
    }),
    // Persona + wizard instructions + JSON schema in a markdown code block.
    await probe("persona_plus_wizard_plus_schema", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        {
          role: "system",
          content:
            PERSONA_SYSTEM_PROMPT +
            `\n\n---\n\nYou are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars.\n\n## Output format\nRespond with ONLY a JSON object matching the schema.\n\n\`\`\`json\n{"type":"object","properties":{"pillars":{"type":"array"}},"required":["pillars"]}\n\`\`\``,
        },
        { role: "user", content: "hello" },
      ],
    }),
    // Full wizard payload with the REAL zod-generated schema embedded.
    await probe("full_pillar_wizard_real_schema", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        {
          role: "system",
          content:
            PERSONA_SYSTEM_PROMPT +
            `\n\n---\n\nYou are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars.\n\nA viable content pillar must sit at the intersection of three things:\n1. The person is an expert at it.\n2. Their audience cares about it.\n3. It logically leads back to their business.\n\nThe standard 5-pillar structure:\n- Pillar 1: Core Competency — tactical/strategic advice\n- Pillar 2: Industry Worldview — thought leadership, contrarian takes\n- Pillar 3: Journey / Build in Public — behind-the-scenes\n- Pillar 4: Audience Mindset / Soft Skills — empathy\n- Pillar 5: Tangential / Personal Passion — relatability\n\nRecommend 3, 4, or 5 pillars. Only recommend what the data supports.\n\n## Output format\nRespond with ONLY a JSON object that matches the schema below.\n- Begin your response with \`{\` and end it with \`}\`.\n- No markdown code fences. No prose. No preamble. No commentary.\n- All required fields must be present. Use the exact field names.\n\n\`\`\`json\n${JSON.stringify(z.toJSONSchema(pillarsSchema), null, 2)}\n\`\`\``,
        },
        {
          role: "user",
          content:
            "Here are my discovery answers. Synthesize these into 3-5 content pillars.\n\n**What I could speak about for 45 minutes with no prep:**\nbaseball\n\n**Bad advice in my industry that drives me crazy:**\nbaseball\n\n**My unfair advantage:**\nbaseball\n\n**Top 3 problems my ideal client is trying to solve:**\nbaseball\n\n**What my audience needs to believe to be ready to buy:**\nbaseball\n\n**What people actually ask me on calls, in comments, and DMs:**\nbaseball",
        },
      ],
    }),
    // Full wizard payload: persona + schema + user "baseball" answers.
    await probe("full_pillar_wizard", {
      model: "moonshotai/kimi-k2.6",
      messages: [
        {
          role: "system",
          content:
            PERSONA_SYSTEM_PROMPT +
            `\n\n---\n\nYou are a content strategy consultant helping a founder define their 3-5 core LinkedIn content pillars.\n\n## Output format\nRespond with ONLY a JSON object matching the schema.\n\n\`\`\`json\n{"type":"object","properties":{"pillars":{"type":"array"}},"required":["pillars"]}\n\`\`\``,
        },
        {
          role: "user",
          content:
            "Here are my discovery answers. Synthesize these into 3-5 content pillars.\n\n**What I could speak about for 45 minutes with no prep:**\nbaseball\n\n**Bad advice in my industry that drives me crazy:**\nbaseball\n\n**My unfair advantage:**\nbaseball\n\n**Top 3 problems my ideal client is trying to solve:**\nbaseball\n\n**What my audience needs to believe to be ready to buy:**\nbaseball\n\n**What people actually ask me on calls, in comments, and DMs:**\nbaseball",
        },
      ],
    }),
  ];

  return NextResponse.json({
    openrouter_total_models: data.data.length,
    configured_count: HI_LOW_SLUGS.length,
    missing_count: missingCount,
    key_prefix: `${key.slice(0, 16)}...${key.slice(-4)}`,
    vercel_region: process.env.VERCEL_REGION ?? "(unknown)",
    probes,
    models: report,
  });
}
