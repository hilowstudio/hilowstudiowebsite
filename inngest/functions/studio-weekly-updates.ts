import { inngest } from "@/lib/inngest/client";
import { getActiveProjectIds } from "@/lib/studio/queries";
import { draftAndStoreUpdate } from "@/lib/studio/client-update";

export const studioWeeklyUpdates = inngest.createFunction(
  {
    id: "studio-weekly-updates",
    retries: 1,
    triggers: [{ cron: "TZ=America/Chicago 0 9 * * 1" }],
  },
  async ({ step }) => {
    const projectIds = await step.run("fetch-active-projects", async () => {
      return getActiveProjectIds();
    });

    if (projectIds.length === 0) {
      return { drafted: 0, skipped: 0 };
    }

    const results = await Promise.all(
      projectIds.map((id) =>
        step.run(`draft-${id}`, async () => {
          try {
            const result = await draftAndStoreUpdate(id, "cron");
            return { id, drafted: Boolean(result) };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { id, drafted: false, error: message };
          }
        }),
      ),
    );

    const drafted = results.filter((r) => r.drafted).length;
    const skipped = results.length - drafted;

    return { drafted, skipped, results };
  },
);
