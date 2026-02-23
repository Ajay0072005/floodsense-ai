import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_AI_CORTEX_URL: process.env.NEXT_PUBLIC_AI_CORTEX_URL || "http://localhost:8000",
  },
};

export default nextConfig;
