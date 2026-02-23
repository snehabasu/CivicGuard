import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ANTHROPIC_API_KEY has no NEXT_PUBLIC_ prefix so it stays server-side only.
  // No additional configuration needed to enforce this.
};

export default nextConfig;
