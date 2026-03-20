import type { NextConfig } from "next";

// Internal backend URL — used for server-side rewrites (not exposed to the browser)
const backendUrl =
  process.env.INTERNAL_BACKEND_URL || "http://backend:8000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.101", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/health", destination: `${backendUrl}/health` },
      { source: "/healthz", destination: `${backendUrl}/healthz` },
      { source: "/ws/:path*", destination: `${backendUrl}/ws/:path*` },
    ];
  },
};

export default nextConfig;
