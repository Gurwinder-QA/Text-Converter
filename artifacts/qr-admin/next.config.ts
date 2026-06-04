import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod"],
  allowedDevOrigins: ["*.sisko.replit.dev", "*.replit.dev"],
  experimental: {
    optimizePackageImports: ["flowbite-react", "lucide-react"],
  },
};

export default nextConfig;
