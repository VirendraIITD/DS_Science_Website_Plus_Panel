import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BlogFilters } from '@/components/site/BlogFilters';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Preparation advice, exam updates and study plans for NEET and JEE aspirants.',
  alternates: { canonical: '/blog' },
};

const getBlogPageData = cachedQuery(
  ['blog-page-data'],
  () =>
    db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    }),
  600,
);

/** [PRO] SEO articles (PRD §6.3). Hidden entirely on the Elite tier. */
export default async function BlogPage() {
  if (!isPro()) notFound();

  const posts = await getBlogPageData();

  const featured = posts[0];
  const rest = posts.slice(1);
  const categories = [...new Set(rest.map((p) => p.category))];

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Blog</div>
          <h1>Blog</h1>
          <p>NEET and JEE preparation, exam updates and study tips — straight from our faculty and counsellors.</p>
          <div className="facts">
            <div>
              <b>{posts.length}</b>
              <span>Articles</span>
            </div>
            <div>
              <b>Free</b>
              <span>No login needed</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {posts.length === 0 ? (
            <EmptyState icon="✍️" text="Articles are on the way." />
          ) : (
            <>
              {featured ? (
                <div className="ds-nfeat">
                  <div className="im5">
                    {featured.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div className="b3">
                    <span className="pin">⭐ FEATURED</span>
                    <h3>
                      <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                    </h3>
                    <div className="dt3">{shortDate(featured.publishedAt ?? featured.createdAt)}</div>
                    {featured.excerpt ? <p>{featured.excerpt}</p> : null}
                    <div style={{ marginTop: '18px' }}>
                      <Link href={`/blog/${featured.slug}`} className="ds-btn navy sm">
                        Read the article →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}

              <BlogFilters
                posts={rest.map((p) => ({
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  category: p.category,
                  excerpt: p.excerpt,
                  coverUrl: p.coverUrl,
                  dateLabel: shortDate(p.publishedAt ?? p.createdAt),
                }))}
                categories={categories}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
