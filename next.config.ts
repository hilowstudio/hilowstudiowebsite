import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Inngest SDK reads INNGEST_SIGNING_KEY and INNGEST_EVENT_KEY by default.
    // We prefix ours with HILOW_ to avoid collision with other projects.
    INNGEST_SIGNING_KEY: process.env.HILOW_INNGEST_SIGNING_KEY,
    INNGEST_EVENT_KEY: process.env.HILOW_INNGEST_EVENT_KEY,
  },
  async redirects() {
    return [
      {
        source: "/consulting",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
