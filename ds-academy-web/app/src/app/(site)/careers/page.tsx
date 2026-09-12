import type { Metadata } from 'next';

import { CareersApplyForm, OpeningsTable } from '@/components/site/CareersApply';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Open teaching and staff roles at DS Science Academy, Gangapur City.',
  alternates: { canonical: '/careers' },
};

export default async function CareersPage() {
  const [openings, reasons, steps, settings] = await Promise.all([
    db.jobOpening.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    db.careerReason.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    db.careerStep.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    getSettings(),
  ]);

  const openPositions = openings.filter((o) => !o.filled).map((o) => o.position);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Careers</div>
          <h1>Careers at DS Science Academy</h1>
          <p>
            We&rsquo;re always looking for good faculty and staff who want to do something meaningful for the
            children of Gangapur City. Small team, big impact.
          </p>
          <div className="facts">
            <div>
              <b>{settings.careersStatSince}</b>
              <span>Since</span>
            </div>
            <div>
              <b>{settings.careersStatTeamSize}</b>
              <span>Team members</span>
            </div>
            <div>
              <b>{openPositions.length}</b>
              <span>Open roles</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Why work with us</h2>
              <p className="st">Working in a smaller city has its own advantages — this is what you get here.</p>
            </div>
          </div>
          <div className="ds-wgrid">
            {reasons.map((w) => (
              <div key={w.id} className="ds-wcard">
                <div className="ic">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Current openings</h2>
              <p className="st">Don&rsquo;t see the right role? Send your resume anyway — a need sometimes comes up suddenly.</p>
            </div>
          </div>
          <OpeningsTable openings={openings as never} />
        </div>
      </section>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">How to apply</h2>
              <p className="st">A simple 4-step process — no long interview cycles.</p>
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
            <h2>{settings.careersAdmHeading}</h2>
            <p>{settings.careersAdmNote}</p>
            <div className="pts">
              {settings.careersAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <CareersApplyForm positions={openPositions} />
        </div>
      </section>
    </>
  );
}
