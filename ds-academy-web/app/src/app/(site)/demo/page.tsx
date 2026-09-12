import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DemoForm } from '@/components/site/DemoForm';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Book a Free Demo Class',
  description: 'Sit in on a real class before you decide — online or at the centre.',
  alternates: { canonical: '/demo' },
};

const WHAT_TO_EXPECT = [
  { icon: '📖', title: 'A full-length class, not a trailer', body: 'The same session the batch gets every day — same pace, same depth, same teacher.' },
  { icon: '🙋', title: 'You can ask anything, right there', body: 'Stop the teacher, ask a doubt, see how it is actually handled — not just told about.' },
  { icon: '👨‍👩‍👦', title: 'Parents can sit in too', body: 'Come along and watch the class yourself — most parents find this more convincing than any brochure.' },
  { icon: '💬', title: 'Fee and batch explained after', body: 'A counsellor walks you through timing, fees and instalments once the class ends — no pressure to decide that day.' },
];

const getDemoPageData = cachedQuery(
  ['demo-page-data'],
  () =>
    Promise.all([
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
      db.branch.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
        orderBy: { order: 'asc' },
      }),
      db.demoHighlight.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.demoStep.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    ]),
  600,
);

/** [PRO] Book-a-Demo (PRD §6.3). */
export default async function DemoPage() {
  if (!isPro()) notFound();

  const [settings, [courses, branches, highlights, steps]] = await Promise.all([
    getSettings(),
    getDemoPageData(),
  ]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Book a Demo Class</div>
          <h1>Sit in a real class before you decide</h1>
          <p>
            No sales pitch, no separate &ldquo;demo batch&rdquo; put on for visitors. You sit through
            the same class the enrolled students attend. Choose to come to the campus, or join live
            from home.
          </p>
          <div className="facts">
            <div>
              <b>Free</b>
              <span>No charge, no obligation</span>
            </div>
            <div>
              <b>🏫 + 💻</b>
              <span>Offline or Live — your choice</span>
            </div>
            <div>
              <b>Parents</b>
              <span>Welcome to sit in too</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">What to expect</h2>
              <p className="st">The demo is exactly what a real day looks like here — nothing is staged for the visit.</p>
            </div>
          </div>
          {settings.demoIntro ? <p className="st" style={{ marginBottom: '18px' }}>{settings.demoIntro}</p> : null}
          <div className="ds-usp">
            {(highlights.length > 0
              ? highlights.map((h) => ({ icon: '✔️', title: h.text, body: '' }))
              : WHAT_TO_EXPECT
            ).map((w) => (
              <div key={w.title} className="ds-ucard">
                <div className="ic">{w.icon}</div>
                <div>
                  <b>{w.title}</b>
                  {w.body ? <p>{w.body}</p> : null}
                </div>
              </div>
            ))}
          </div>

          {settings.demoParentNote ? (
            <div className="ds-note" style={{ marginTop: '24px' }}>
              <h4>👨‍👩‍👦 Bringing a parent?</h4>
              <p>{settings.demoParentNote}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">How it works</h2>
              <p className="st">Three steps, no forms to sign that day.</p>
            </div>
          </div>
          <div className="ds-steps">
            {steps.map((s, i) => (
              <div key={s.id} className="ds-step">
                <div className="no">{i + 1}</div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.demoAdmHeading}</h2>
            <p>{settings.demoAdmNote}</p>
            <div className="pts">
              {settings.demoAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <DemoForm courses={courses.map((c) => c.name)} branches={branches} />
        </div>
      </section>
    </>
  );
}
