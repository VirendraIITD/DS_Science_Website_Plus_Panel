/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    // Uploads live in Azure Blob Storage (src/lib/upload.ts), not on this
    // origin — next/image needs the hostname allowlisted to optimise them.
    // Hostnames are hardcoded rather than derived from env vars: this file
    // is evaluated at `next build` time, when dashboard/app environment
    // variables may not be forwarded into the build stage, so reading an
    // env var here could silently produce an empty pattern list.
    remotePatterns: [
      // Legacy Supabase URLs (remove once all DB URLs are migrated).
      { protocol: 'https', hostname: 'tlftpbgifzleugqjfzxv.supabase.co' },
      // Azure Blob Storage — current upload target (src/lib/upload.ts).
      { protocol: 'https', hostname: 'dssciencepanel.blob.core.windows.net' },
      // Fallback for a future S3/CDN migration, if MEDIA_BASE_URL is ever set.
      ...(process.env.MEDIA_BASE_URL
        ? [{ protocol: 'https', hostname: new URL(process.env.MEDIA_BASE_URL).hostname }]
        : []),
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

