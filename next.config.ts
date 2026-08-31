import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
