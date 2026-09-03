import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // The admin panel is never indexed; it is an internal tool.
  transpilePackages: ['@full-story/types'],
  outputFileTracingRoot: join(currentDirectory, '../..'),
  experimental: {
    serverActions: {
      // Next's default is 1 MB. Hero image and in-editor image uploads go
      // through a Server Action carrying the raw file, and the backend
      // itself allows up to 5 MB (MAX_IMAGE_SIZE_BYTES) - Next's own limit
      // was rejecting anything above 1 MB before that check ever ran.
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
