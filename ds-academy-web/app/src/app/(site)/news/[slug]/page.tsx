import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Pill } from '@/components/ui/Pill';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';

export const revalidate = 300;

// Keyed by slug so each notice gets its own cache entry, shared between
// generateMetadata and the page body below instead of querying twice.
const getNewsItem = (slug: string) =>
  cachedQuery(['news-item', slug], () => db.news.findUnique({ where: { slug } }), 300)();

// No generateStaticParams(): these pages render on first request instead of
// at build time — the build image has no DB access (see Dockerfile), and
// static params would otherwise need a live DB connection during `next build`.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getNewsItem(params.slug);
  if (!item) return { title: 'Notice not found' };

  return {
    title: item.title,
    description: item.body.slice(0, 160),
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: {
      type: 'article',
      publishedTime: new Date(item.date).toISOString(),
      images: item.imageUrl ? [{ url: item.imageUrl }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const item = await getNewsItem(params.slug);
  if (!item || item.status !== 'PUBLISHED') notFound();

  return (
    <article className="section">
      <div className="container-ds max-w-3xl">
        <Link href="/news" className="text-[13px] font-semibold text-brand hover:underline">
          ← All news
        </Link>

        <div className="mb-3 mt-5 flex flex-wrap items-center gap-2">
          <Pill tone={item.type === 'EVENT' ? 'y' : 'b'}>
            {item.type === 'EVENT' ? 'Event' : 'Notice'}
          </Pill>
          <span className="text-[12.5px] text-mut">{shortDate(item.date)}</span>
        </div>

        <h1 className="text-[28px] font-extrabold leading-tight text-navy sm:text-[34px]">
          {item.title}
        </h1>

        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="mt-6 w-full rounded-card border border-line object-cover"
          />
        ) : null}

        <div className="prose-ds mt-6">
          {item.body.split(/\n{2,}/).filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* schema.org so Google can show this as an article (PRD §9). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: item.title,
              datePublished: new Date(item.date).toISOString(),
              dateModified: new Date(item.updatedAt).toISOString(),
              articleBody: item.body.slice(0, 500),
            }),
          }}
        />
      </div>
    </article>
  );
}
