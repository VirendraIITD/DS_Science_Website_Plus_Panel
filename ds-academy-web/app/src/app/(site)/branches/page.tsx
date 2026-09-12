import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Our Centres',
  description: 'Addresses, phone numbers and directions for every DS Science Academy centre.',
  alternates: { canonical: '/branches' },
};

const getBranchesPageData = cachedQuery(
  ['branches-page-data'],
  () =>
    db.branch.findMany({
      where: { status: { not: 'CLOSED' } },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
  600,
);

/** [PRO] Multi-branch contact pages (PRD §6.3). */
export default async function BranchesPage() {
  if (!isPro()) notFound();

  const branches = await getBranchesPageData();

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Our Centres</div>
          <h1>Our centres</h1>
          <p>Find the one nearest to you.</p>
          <div className="facts">
            <div>
              <b>{branches.length}</b>
              <span>Centres</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {branches.length === 0 ? (
            <EmptyState icon="🏢" text="Centre details are being added." />
          ) : (
            <div className="ds-2col">
              {branches.map((b) => (
                <div key={b.id} className="ds-facard">
                  <div className="im">
                    {b.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.imageUrl} alt={b.name} />
                    ) : (
                      'CENTRE PHOTO'
                    )}
                  </div>
                  <div className="b">
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
                      <h4 style={{ margin: 0 }}>{b.name}</h4>
                      {b.isMain ? <span className="tagn tn-notice">MAIN CAMPUS</span> : null}
                      {b.status === 'SETUP' ? <span className="tagn tn-event">OPENING SOON</span> : null}
                    </div>

                    <p style={{ margin: 0 }}>{b.address || b.city}</p>
                    {b.phone ? (
                      <p style={{ marginTop: '7px' }}>
                        📞{' '}
                        <a href={`tel:${b.phone}`} style={{ color: 'var(--ds-blue)', fontWeight: 700 }}>
                          {b.phone}
                        </a>
                      </p>
                    ) : null}
                    {b.email ? (
                      <p style={{ marginTop: '4px', wordBreak: 'break-all' }}>
                        ✉️{' '}
                        <a href={`mailto:${b.email}`} style={{ color: 'var(--ds-blue)', fontWeight: 700 }}>
                          {b.email}
                        </a>
                      </p>
                    ) : null}
                    {b.studentsCount > 0 ? (
                      <p style={{ marginTop: '4px' }}>👨‍🎓 {b.studentsCount.toLocaleString('en-IN')} students</p>
                    ) : null}

                    {b.mapEmbed ? (
                      <div
                        style={{ marginTop: '14px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--ds-line)' }}
                        dangerouslySetInnerHTML={{ __html: b.mapEmbed }}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
