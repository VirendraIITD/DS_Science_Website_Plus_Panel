import type { MetadataRoute } from 'next';

import { db } from '@/lib/db';
import { siteUrl } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const dynamic = 'force-dynamic';

/** PRD §9 — sitemap.xml covering every public page, including dynamic ones. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/about'), changeFrequency: 'monthly', priority: 0.7 },
    { url: siteUrl('/courses'), changeFrequency: 'monthly', priority: 0.9 },
    { url: siteUrl('/results'), changeFrequency: 'monthly', priority: 0.9 },
    { url: siteUrl('/faculty'), changeFrequency: 'monthly', priority: 0.6 },
    { url: siteUrl('/facilities'), changeFrequency: 'yearly', priority: 0.5 },
    { url: siteUrl('/gallery'), changeFrequency: 'monthly', priority: 0.5 },
    { url: siteUrl('/downloads'), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteUrl('/news'), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteUrl('/admissions'), changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/contact'), changeFrequency: 'yearly', priority: 0.8 },
    ...(isPro()
      ? ([
          { url: siteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
          { url: siteUrl('/faq'), changeFrequency: 'monthly', priority: 0.6 },
          { url: siteUrl('/predictor'), changeFrequency: 'monthly', priority: 0.8 },
          { url: siteUrl('/demo'), changeFrequency: 'monthly', priority: 0.7 },
          { url: siteUrl('/branches'), changeFrequency: 'monthly', priority: 0.6 },
        ] as MetadataRoute.Sitemap)
      : []),
  ];

  const [courses, news, posts] = await Promise.all([
    db.course.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.news.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    isPro()
      ? db.blogPost.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
  ]);

  return [
    ...staticPages,
    ...courses.map((c) => ({
      url: siteUrl(`/courses/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: siteUrl(`/news/${n.slug}`),
      lastModified: n.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...posts.map((p) => ({
      url: siteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
