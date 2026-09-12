import type { Metadata } from 'next';

import { FacultyGrid } from '@/components/site/FacultyFilters';
import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Faculty',
  description: 'The teachers at DS Science Academy — subject, qualification and experience.',
  alternates: { canonical: '/faculty' },
};

const getFacultyPageData = cachedQuery(
  ['faculty-page-data'],
  () =>
    Promise.all([
      db.faculty.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
      db.facultyReason.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    ]),
  600,
);

export default async function FacultyPage() {
  const [[faculty, courses, whyFaculty], settings] = await Promise.all([getFacultyPageData(), getSettings()]);

  const subjectCount = new Set(faculty.map((f) => f.subject)).size;
  const withExp = faculty.filter((f) => f.experienceYears > 0);
  const avgExp = withExp.length
    ? Math.round(withExp.reduce((s, f) => s + f.experienceYears, 0) / withExp.length)
    : 0;

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Faculty</div>
          <h1>The people who will teach you</h1>
          <p>
            Nobody here is a visiting guest lecturer who disappears in December — the teacher who
            starts your batch is the teacher who finishes it.
          </p>
          <div className="facts">
            <div>
              <b>{faculty.length}</b>
              <span>Faculty members</span>
            </div>
            {avgExp > 0 ? (
              <div>
                <b>{avgExp} yrs</b>
                <span>Average experience</span>
              </div>
            ) : null}
            <div>
              <b>{subjectCount}</b>
              <span>Subject departments</span>
            </div>
            <div>
              <b>{settings.facultyStatStudentsPerTeacher}</b>
              <span>Students per teacher</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Our teaching team</h2>
              <p className="st">Filter by subject to see who teaches what.</p>
            </div>
          </div>

          {faculty.length === 0 ? (
            <EmptyState icon="👨‍🏫" text="Faculty profiles are being added." />
          ) : (
            <FacultyGrid faculty={faculty} />
          )}
        </div>
      </section>

      {whyFaculty.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">Why this matters more than it sounds</h2>
                <p className="st">Coaching in small towns has one recurring problem: teachers leave mid-session. Here is how we avoid it.</p>
              </div>
            </div>
            <div className="ds-wgrid">
              {whyFaculty.map((w) => (
                <div key={w.id} className="ds-wcard">
                  <div className="ic">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.facultyAdmHeading}</h2>
            <p>{settings.facultyAdmNote}</p>
            <div className="pts">
              {settings.facultyAdmPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Book a free demo class"
            note="We will call to confirm the day and time."
          />
        </div>
      </section>
    </>
  );
}
