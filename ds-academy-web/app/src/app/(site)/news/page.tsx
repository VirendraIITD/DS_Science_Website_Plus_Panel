import type { Metadata } from 'next';
import Link from 'next/link';

import { NewsFilters } from '@/components/site/NewsFilters';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';
import { getSettings, whatsappLink } from '@/lib/settings';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'News & Events',
  description: 'Notices, admission dates and events from DS Science Academy.',
  alternates: { canonical: '/news' },
};

const getNewsPageData = cachedQuery(
  ['news-page-data'],
  () =>
    Promise.all([
      db.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
        take: 60,
      }),
      db.download.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    ]),
  300,
);

export default async function NewsPage() {
  const [[items, downloads], settings] = await Promise.all([getNewsPageData(), getSettings()]);

  const featured = items.find((n) => n.pinned) ?? items[0];
  const rest = items.filter((n) => n.id !== featured?.id);

  const wa = whatsappLink(
    settings.whatsappNumber,
    `Hello ${settings.instituteName}, please add me to news & notice updates.`,
  );

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; News &amp; Notices</div>
          <h1>News &amp; notices</h1>
          <p>
            Batch dates, test schedules, results and holidays — everything the office puts on the
            notice board goes up here the same day.
          </p>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {items.length === 0 ? (
            <EmptyState icon="📰" text="No notices right now. Check back before the next session." />
          ) : (
            <div className="ds-nlay">
              <div>
                {featured ? (
                  <div className="ds-nfeat">
                    <div className="im5" />
                    <div className="b3">
                      {featured.pinned ? <span className="pin">📌 PINNED</span> : null}
                      <h3>
                        <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
                      </h3>
                      <div className="dt3">
                        {shortDate(featured.date)} · {featured.type === 'EVENT' ? 'Event' : 'Notice'}
                      </div>
                      {featured.body ? <p>{featured.body}</p> : null}
                      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link href="/admissions" className="ds-btn navy sm">
                          Admission details
                        </Link>
                        <Link href="/downloads" className="ds-btn lineb sm">
                          Download prospectus
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* n.date already comes back as a string, not a Date instance —
                    cachedQuery's underlying unstable_cache JSON-serialises
                    everything it returns, so any DateTime field loses its
                    Date-object methods on the way out. */}
                <NewsFilters items={rest.map((n) => ({ id: n.id, slug: n.slug, title: n.title, type: n.type, body: n.body, date: new Date(n.date).toISOString() }))} />
              </div>

              <aside>
                {downloads.length > 0 ? (
                  <div className="ds-sbox">
                    <h4>QUICK DOWNLOADS</h4>
                    {downloads.map((d) => (
                      <div key={d.id} className="ds-srow">
                        <span className="d2">PDF</span>
                        <span className="t3">{d.title}</span>
                      </div>
                    ))}
                    <Link href="/downloads" className="ds-btn lineb sm" style={{ width: '100%', marginTop: '14px' }}>
                      All downloads →
                    </Link>
                  </div>
                ) : null}

                {wa ? (
                  <div className="ds-note">
                    <h4>📱 Get updates on WhatsApp</h4>
                    <p>
                      Test schedules, result announcements and holiday notices — sent to parents on
                      WhatsApp. No promotional messages.
                    </p>
                    <a href={wa} target="_blank" rel="noreferrer" className="ds-btn gold sm" style={{ width: '100%', marginTop: '11px' }}>
                      Chat with us on WhatsApp
                    </a>
                  </div>
                ) : null}
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
