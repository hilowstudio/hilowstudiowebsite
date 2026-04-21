import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { rebuildWarmProspects } from "@/lib/ops/network/warm-prospects";
import { sendWarmProspectDigest } from "@/lib/ops/network/digest-email";

export const opsNetworkDigest = inngest.createFunction(
  {
    id: "ops-network-digest",
    retries: 1,
    triggers: [{ cron: "TZ=America/Chicago 0 8 * * 1" }],
  },
  async ({ step }) => {
    const clients = await step.run("list-active-clients", async () => {
      const { data } = await supabase
        .from("ops_clients")
        .select("id")
        .eq("status", "active");
      return (data ?? []) as { id: string }[];
    });

    if (clients.length === 0) {
      return { clients: 0, sent: 0 };
    }

    let sent = 0;
    for (const c of clients) {
      await step.run(`score-${c.id}`, async () => {
        await rebuildWarmProspects(c.id);
      });

      const result = await step.run(`digest-${c.id}`, async () => {
        try {
          return await sendWarmProspectDigest(c.id);
        } catch (err) {
          return {
            sent: false,
            recipients: 0,
            prospects: 0,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      });

      if (result.sent) sent += 1;
    }

    return { clients: clients.length, sent };
  },
);
