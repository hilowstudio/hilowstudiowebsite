import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/consulting",
        destination: "/services",
        permanent: true,
      },
      // Folded into /services (2026-11 redesign)
      { source: "/services/bespoke", destination: "/services#bespoke", permanent: true },
      { source: "/services/catalog", destination: "/services#catalog", permanent: true },
      // Retired pages
      { source: "/kinandcairn", destination: "/", permanent: true },
      { source: "/work", destination: "/#products", permanent: true },
      { source: "/philosophy", destination: "/about", permanent: true },
      // The notebook is off for now and will come back, so these stay temporary
      { source: "/notebook", destination: "/", permanent: false },
      { source: "/notebook/:slug*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
