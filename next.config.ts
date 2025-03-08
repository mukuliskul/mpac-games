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
    return [
      {
        source: '/',
        destination: '/games',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
