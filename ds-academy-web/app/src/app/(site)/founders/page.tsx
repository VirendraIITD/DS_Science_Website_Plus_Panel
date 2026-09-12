import type { Metadata } from 'next';

import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Our Founders',
  description: 'The people behind DS Science Academy.',
  alternates: { canonical: '/founders' },
};

const getFoundersPageData = cachedQuery(
  ['founders-page-data'],
  () => db.founder.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  600,
);

export default async function FoundersPage() {
  const founders = await getFoundersPageData();

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Founders</div>
          <h1>The people behind DS Science Academy</h1>
          <p>Every batch, every classroom and every result on this site traces back to the people below.</p>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {founders.length === 0 ? (
            <EmptyState icon="🧑‍🏫" text="Founder profiles are being added." />
          ) : (
            <div className="ds-fcgrid">
              {founders.map((f) => (
                <article key={f.id} className="ds-fbig">
                  <div className="im3">
                    {f.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.photoUrl} alt={f.name} />
                    ) : null}
                  </div>
                  <div className="b2">
                    <h4>{f.name}</h4>
                    {f.role ? <div className="sb">{f.role.toUpperCase()}</div> : null}
                    {f.quote ? <p style={{ fontStyle: 'italic' }}>&ldquo;{f.quote}&rdquo;</p> : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
