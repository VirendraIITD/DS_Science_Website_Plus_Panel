import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Analytics } from '@/components/site/Analytics';
import { getSettings, siteUrl } from '@/lib/settings';

import './globals.css';

// Root layout also reads settings from the DB (generateMetadata below) — needed
// so /not-found (which has no closer layout of its own) doesn't get
// statically prerendered at build time either. See (site)/layout.tsx for why.
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f2149',
};

/** Titles, description and OG defaults all come from Admin › Settings. */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: s.seoTitle || s.instituteName,
      template: `%s — ${s.instituteName}`,
    },
    description: s.seoDescription || s.tagline,
    keywords: s.seoKeywords ? s.seoKeywords.split(',').map((k) => k.trim()) : undefined,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: {
      type: 'website',
      siteName: s.instituteName,
      title: s.seoTitle || s.instituteName,
      description: s.seoDescription || s.tagline,
      locale: 'en_IN',
      images: s.ogImageUrl ? [{ url: s.ogImageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: s.seoTitle || s.instituteName,
      description: s.seoDescription || s.tagline,
    },
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
      : undefined,
    alternates: { canonical: '/' },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();

  return (
    <html lang="en">
      <head>
        {/* Branding colours from Settings, applied without a rebuild. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--navy:${s.primaryColor};--accent:${s.accentColor}}`,
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
        >
          Skip to content
        </a>
        {children}
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
