/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    // Uploads live in Supabase Storage (src/lib/upload.ts), not on this
    // origin — next/image needs the hostname allowlisted to optimise them.
    // Hardcoded rather than derived from process.env.SUPABASE_URL: this file
    // is evaluated at `next build` time, and Railway does not forward
    // dashboard Variables into the Docker build stage (see
    // ds-academy-web-deploy notes / the generateStaticParams saga) — reading
    // the env var here would silently produce an empty pattern list on every
    // real Railway build even though it works fine locally with `.env`.
    remotePatterns: [
      { protocol: 'https', hostname: 'tlftpbgifzleugqjfzxv.supabase.co' },
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
