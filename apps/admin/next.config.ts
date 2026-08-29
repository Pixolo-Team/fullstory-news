import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // The admin panel is never indexed; it is an internal tool.
  transpilePackages: ['@full-story/types'],
  outputFileTracingRoot: join(currentDirectory, '../..'),
};

export default nextConfig;
