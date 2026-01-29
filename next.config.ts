import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // Match Supabase Storage limit for logo uploads
    },
  },
};

export default nextConfig;
