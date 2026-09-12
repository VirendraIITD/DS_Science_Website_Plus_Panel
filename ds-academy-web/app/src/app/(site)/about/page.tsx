import type { Metadata } from 'next';

import { LeadForm } from '@/components/site/LeadForm';
import { StatsStrip } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'About Us',
    description: `About ${s.instituteName} — ${s.tagline}`,
    alternates: { canonical: '/about' },
  };
}

const getAboutPageData = cachedQuery(
  ['about-page-data'],
  () =>
    Promise.all([
      db.statItem.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 4 }),
      db.whyPoint.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.faculty.count({ where: { active: true } }),
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    ]),
  600,
);

export default async function AboutPage() {
  const [settings, [stats, why, faculty, courses]] = await Promise.all([getSettings(), getAboutPageData()]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; About Us</div>
          <h1>{settings.instituteName}</h1>
          <p>{settings.tagline}</p>
        </div>
      </div>

      <StatsStrip stats={stats} />

      <section className="ds-sec">
        <div className="container-ds ds-2col" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          <div>
            <h2 className="t" style={{ marginBottom: '18px' }}>
              Our story
            </h2>
            <div className="ds-prose">
              {(settings.about || '')
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              {!settings.about ? (
                <p style={{ color: 'var(--ds-mut)' }}>Add your institute&apos;s story from Admin › Settings › About.</p>
              ) : null}
            </div>
          </div>

          <aside className="ds-wcard" style={{ padding: '25px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '13px' }}>At a glance</h2>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <dt style={{ width: '90px', flexShrink: 0, color: 'var(--ds-mut)' }}>Location</dt>
                <dd style={{ fontWeight: 600 }}>{settings.address}</dd>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <dt style={{ width: '90px', flexShrink: 0, color: 'var(--ds-mut)' }}>Faculty</dt>
                <dd style={{ fontWeight: 600 }}>{faculty} teachers</dd>
              </div>
              {settings.phones[0] ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <dt style={{ width: '90px', flexShrink: 0, color: 'var(--ds-mut)' }}>Phone</dt>
                  <dd style={{ fontWeight: 600 }}>
                    <a href={`tel:${settings.phones[0]}`} style={{ color: 'var(--ds-blue)' }}>
                      {settings.phones[0]}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.emails[0] ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <dt style={{ width: '90px', flexShrink: 0, color: 'var(--ds-mut)' }}>Email</dt>
                  <dd style={{ fontWeight: 600, wordBreak: 'break-word' }}>
                    <a href={`mailto:${settings.emails[0]}`} style={{ color: 'var(--ds-blue)' }}>
                      {settings.emails[0]}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      {why.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">What we actually believe</h2>
                <p className="st">Not a mission statement. Just the things we keep coming back to.</p>
              </div>
            </div>
            <div className="ds-usp">
              {why.map((p) => (
                <div key={p.id} className="ds-ucard">
                  <div className="ic">{p.icon || '✔️'}</div>
                  <div>
                    <b>{p.title}</b>
                    <p>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.aboutAdmHeading}</h2>
            <p>{settings.aboutAdmNote}</p>
            <div className="pts">
              {settings.aboutAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Plan a visit"
            note="Tell us when, we will keep someone free."
          />
        </div>
      </section>
    </>
  );
}
