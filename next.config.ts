import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // optimized for Docker / Coolify deployment
  reactStrictMode: true,
};

export default nextConfig;
