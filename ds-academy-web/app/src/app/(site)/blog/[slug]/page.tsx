import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Pill } from '@/components/ui/Pill';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';
import { getSettings, siteUrl } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

// Keyed by slug so each article gets its own cache entry, shared between
// generateMetadata and the page body below instead of querying twice.
const getBlogPost = (slug: string) =>
  cachedQuery(['blog-post', slug], () => db.blogPost.findUnique({ where: { slug } }), 600)();

// No generateStaticParams(): these pages render on first request instead of
// at build time — the build image has no DB access (see Dockerfile), and
// static params would otherwise need a live DB connection during `next build`.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Article not found' };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: new Date(post.publishedAt ?? post.createdAt).toISOString(),
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  if (!isPro()) notFound();

  const post = await getBlogPost(params.slug);
  if (!post || post.status !== 'PUBLISHED') notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    cachedQuery(
      ['blog-related', post.category, post.id],
      () =>
        db.blogPost.findMany({
          where: { status: 'PUBLISHED', category: post.category, id: { not: post.id } },
          orderBy: { publishedAt: 'desc' },
          take: 3,
        }),
      600,
    )(),
  ]);

  return (
    <article className="section">
      <div className="container-ds max-w-3xl">
        <Link href="/blog" className="text-[13px] font-semibold text-brand hover:underline">
          ← All articles
        </Link>

        <div className="mb-3 mt-5 flex flex-wrap items-center gap-2">
          <Pill tone="b">{post.category}</Pill>
          <span className="text-[12.5px] text-mut">
            {shortDate(post.publishedAt ?? post.createdAt)}
          </span>
        </div>

        <h1 className="text-[28px] font-extrabold leading-tight text-navy sm:text-[34px]">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-3 text-[16px] leading-7 text-mut">{post.excerpt}</p>
        ) : null}

        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt=""
            className="mt-6 w-full rounded-card border border-line object-cover"
          />
        ) : null}

        <div className="prose-ds mt-6">
          {post.body.split(/\n{2,}/).filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {related.length > 0 ? (
          <aside className="mt-12 border-t border-line pt-8">
            <h2 className="mb-4 text-[17px] font-bold text-navy">More on {post.category}</h2>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/blog/${r.slug}`} className="text-[14px] text-brand hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.seoDescription || post.excerpt,
              datePublished: new Date(post.publishedAt ?? post.createdAt).toISOString(),
              dateModified: new Date(post.updatedAt).toISOString(),
              image: post.coverUrl || undefined,
              mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
              publisher: { '@type': 'Organization', name: settings.instituteName },
            }),
          }}
        />
      </div>
    </article>
  );
}
