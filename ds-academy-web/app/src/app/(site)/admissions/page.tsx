import type { Metadata } from 'next';
import Link from 'next/link';

import { LeadForm } from '@/components/site/LeadForm';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Admissions & Scholarship',
  description:
    'How to take admission at DS Science Academy, Gangapur City — batches, scholarship test and fees.',
  alternates: { canonical: '/admissions' },
};

const getAdmissionsPageData = cachedQuery(
  ['admissions-page-data'],
  () =>
    Promise.all([
      db.course.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.news.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
        take: 3,
      }),
      db.admissionStep.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      isPro() ? db.faq.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 6 }) : Promise.resolve([]),
      db.eligibilityRow.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    ]),
  300,
);

export default async function AdmissionsPage() {
  const [settings, [courses, notices, steps, faqs, eligibility]] = await Promise.all([
    getSettings(),
    getAdmissionsPageData(),
  ]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Admissions</div>
          <h1>{settings.admissionsHeading}</h1>
          <p>{settings.admissionsIntro}</p>
          <div className="facts">
            <div>
              <b>{settings.admissionsStatSeatsPerBatch}</b>
              <span>Seats per batch</span>
            </div>
            <div>
              <b>{settings.admissionsStatFeeInstalments}</b>
              <span>Fee instalments</span>
            </div>
          </div>
        </div>
      </div>

      {steps.length > 0 ? (
        <section className="ds-sec">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">How admission works</h2>
                <p className="st">Nobody is asked to pay before they have seen a class.</p>
              </div>
            </div>
            <div className="ds-steps" style={{ gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)` }}>
              {steps.map((s, i) => (
                <div key={s.id} className="ds-step">
                  <div className="no">{i + 1}</div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>

            {notices.length > 0 ? (
              <div style={{ marginTop: '32px', background: '#fdf3dd', border: '1px solid #f0dca8', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#9a6b00', marginBottom: '10px' }}>Current notices</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  {notices.map((n) => (
                    <li key={n.id}>
                      <Link href={`/news/${n.slug}`} style={{ fontWeight: 700, color: '#9a6b00' }}>
                        {n.title}
                      </Link>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(154,107,0,0.7)' }}>{shortDate(n.date)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Who can join which batch</h2>
              <p className="st">Eligibility is simple — the class you are in decides the batch. There is no admission test.</p>
            </div>
          </div>
          <div className="ds-tblw">
            <table>
              <thead>
                <tr>
                  <th>BATCH</th>
                  <th>YOU SHOULD BE</th>
                  <th>TIMING</th>
                </tr>
              </thead>
              <tbody>
                {eligibility.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.batch}</b>
                    </td>
                    <td>{r.who}</td>
                    <td>{r.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">What to bring</h2>
              <p className="st">This is the whole list. Nothing else is needed on the day of admission.</p>
            </div>
          </div>
          <div className="ds-dlist">
            {settings.admissionsWhatToBring.map((item, i) => (
              <div key={item}>
                <i>{i + 1}</i> {item}
              </div>
            ))}
          </div>
          <p className="st" style={{ marginTop: '18px' }}>
            Missing something? Come anyway. We can start the process and you can bring the rest within a week.
          </p>
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Fees, plainly</h2>
              <p className="st">One fee, no hidden charges. Printed modules, practice sheets, the PYQ book and all tests are already included.</p>
            </div>
          </div>
          <div className="ds-2col" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
            <div style={{ background: '#fff', border: '1px solid var(--ds-line)', borderRadius: 'var(--ds-r)', padding: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--ds-mut)', lineHeight: 1.7 }}>
                Exact fees vary by course and batch — see the price on each course page, or ask the office
                for a full breakdown by instalment.
              </p>
              <Link href="/courses" className="ds-btn navy sm" style={{ marginTop: '15px' }}>
                See course fees →
              </Link>
            </div>
            <div className="ds-note">
              <h4>🎓 Ways to pay less</h4>
              <p>
                <b>Scholarship test.</b> Free to register, open to everyone. Up to a 100% fee waiver
                depending on your score.
              </p>
              <p>
                <b>Sibling discount.</b> 10% off the second admission when two children from one family
                study here.
              </p>
              <Link href="/contact" className="ds-btn gold sm">
                Ask about the scholarship test
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.admissionsAdmHeading}</h2>
            <p>{settings.admissionsAdmNote}</p>
            <div className="pts">
              {settings.admissionsAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/downloads" className="ds-btn lineb">
                📘 Download the prospectus
              </Link>
              {settings.phones[0] ? (
                <a href={`tel:${settings.phones[0]}`} className="ds-btn line">
                  📱 Call {settings.phones[0]}
                </a>
              ) : null}
            </div>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Book your demo class"
            note="We will call to confirm the day and time."
          />
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className="ds-sec">
          <div className="container-ds">
            <div className="ds-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <h2 className="t">Admission questions</h2>
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
      ) : null}
    </>
  );
}
