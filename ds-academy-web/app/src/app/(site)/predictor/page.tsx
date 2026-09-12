import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LeadForm } from '@/components/site/LeadForm';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Rank & College Predictor',
  description:
    'Enter your NEET or JEE rank and see which colleges are Safe, Moderate or a Reach, based on last year’s closing ranks.',
  alternates: { canonical: '/predictor' },
};

/** [PRO] Public predictor (PRD §6.3). Temporarily disabled — see the "Coming soon" banner below. */
export default async function PredictorPage() {
  if (!isPro()) notFound();

  const [settings, courses, faqs] = await Promise.all([
    getSettings(),
    db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    db.predictorFaq.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Rank Predictor</div>
          <h1>NEET &amp; JEE Rank Predictor</h1>
          <p>
            Enter your rank and get an instant estimate — plus a probable college list based on
            previous years&apos; trends. Free, no login.
          </p>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '70px 30px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1a2f60, #0f2149)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.4px', color: 'var(--ds-gold)' }}>
              COMING SOON
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '14px' }}>
              The rank predictor is being rebuilt.
            </h2>
            <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.75)', fontSize: '14.5px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              We&apos;re updating it with fresh cut-off data. In the meantime, our counsellors can talk
              you through your options directly — leave your number below.
            </p>
          </div>
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.predictorAdmHeading}</h2>
            <p>{settings.predictorAdmNote}</p>
            <div className="pts">
              {settings.predictorAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Get a detailed counselling call"
            note="We will call you to go through your options."
          />
        </div>
      </section>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h2 className="t">Rank predictor questions</h2>
            </div>
          </div>
          <div className="ds-faq">
            {faqs.map((f, i) => (
              <details key={f.id} className="ds-fq" open={i === 0}>
                <summary>{f.question}</summary>
                <div className="a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
