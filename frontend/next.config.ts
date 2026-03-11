import type { NextConfig } from "next";

// Internal backend URL — used for server-side rewrites (not exposed to the browser)
const backendUrl =
  process.env.INTERNAL_BACKEND_URL || "http://backend:8000";

// API routes served by the FastAPI backend (no /api prefix in original paths)
const apiPrefixes = [
  "/agents",
  "/gateways",
  "/organizations",
  "/health",
  "/skills",
  "/boards",
  "/tasks",
  "/tags",
  "/webhooks",
  "/users",
  "/ws",
  "/docs",
  "/openapi.json",
];

const nextConfig: NextConfig = {
  // In dev, Next may proxy requests based on the request origin/host.
  // Allow common local origins so `next dev --hostname 127.0.0.1` works
  // when users access via http://localhost:3000 or http://127.0.0.1:3000.
  // Keep the LAN IP as well for dev on the local network.
  allowedDevOrigins: ["192.168.1.101", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async rewrites() {
    return apiPrefixes.map((prefix) => ({
      source: `${prefix}/:path*`,
      destination: `${backendUrl}${prefix}/:path*`,
    }));
  },
};

export default nextConfig;
