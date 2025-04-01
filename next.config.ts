import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables eslint errors from blocking deploys
  },
};

export default nextConfig;
