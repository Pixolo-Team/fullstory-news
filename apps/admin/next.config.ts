import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The admin panel is never indexed; it is an internal tool.
  transpilePackages: ['@full-story/types'],
};

export default nextConfig;
