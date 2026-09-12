import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/settings';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The panel and the API have nothing for a crawler.
      disallow: ['/admin', '/api'],
    },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
