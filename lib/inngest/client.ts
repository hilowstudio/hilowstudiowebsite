// The Vercel-Inngest integration sets env vars with a HILOW_ prefix.
// The SDK expects INNGEST_SIGNING_KEY and INNGEST_EVENT_KEY.
// Alias them before the SDK reads process.env.
if (process.env.HILOW_INNGEST_SIGNING_KEY && !process.env.INNGEST_SIGNING_KEY) {
  process.env.INNGEST_SIGNING_KEY = process.env.HILOW_INNGEST_SIGNING_KEY;
}
if (process.env.HILOW_INNGEST_EVENT_KEY && !process.env.INNGEST_EVENT_KEY) {
  process.env.INNGEST_EVENT_KEY = process.env.HILOW_INNGEST_EVENT_KEY;
}

import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "hi-low" });
