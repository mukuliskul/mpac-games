import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*", // Allow any domain
      },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
