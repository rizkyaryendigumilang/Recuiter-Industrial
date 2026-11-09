import type { NextConfig } from "next";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';

const nextConfig: NextConfig = {
  basePath: basePath === '' ? undefined : basePath,
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react'],
    agentUpgrade: "security",
  },
  turbopack: {
    root: path.resolve('.'),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
