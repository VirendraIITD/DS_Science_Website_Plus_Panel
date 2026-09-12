import type { Metadata } from 'next';

import { FilterableCourseGrid } from '@/components/site/CourseFilters';
import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { cheapestPackagesByCourse } from '@/lib/courses';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Courses',
  description: 'NEET-UG, IIT-JEE and Foundation courses with class levels, syllabus and fees.',
  alternates: { canonical: '/courses' },
};

const getCoursesPageData = cachedQuery(['courses-page-data'], async () => {
  const [courseRows, fitRows] = await Promise.all([
    db.course.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    db.courseFitRow.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);
  const priceByCourse = await cheapestPackagesByCourse(courseRows.map((c) => c.id));
  const courses = courseRows.map((c) => ({ ...c, price: priceByCourse[c.id] ?? null }));
  return { courses, fitRows };
});

export default async function CoursesPage() {
  const [{ courses, fitRows }, settings] = await Promise.all([getCoursesPageData(), getSettings()]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Courses</div>
          <h1>Our courses</h1>
          <p>
            Four programmes, one teaching method — NCERT first, a weekly test, and the same faculty every
            year. Pick the one that fits, or call us and we will tell you honestly which one does.
          </p>
          <div className="facts">
            <div>
              <b>{courses.length || 4}</b>
              <span>Programmes</span>
            </div>
            <div>
              <b>{settings.coursesStatBatchSize}</b>
              <span>Students per batch</span>
            </div>
            <div>
              <b>{settings.coursesStatEnrolled}</b>
              <span>Students enrolled</span>
            </div>
            <div>
              <b>{settings.coursesStatSelections}</b>
              <span>Selections</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {courses.length === 0 ? (
            <EmptyState icon="📚" text="Courses will be listed here shortly." />
          ) : (
            <FilterableCourseGrid courses={courses} />
          )}
        </div>
      </section>

      {fitRows.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">Which course is for you?</h2>
                <p className="st">Most families already know. If you do not, this table usually settles it in a minute.</p>
              </div>
            </div>
            <div className="ds-tblw">
              <table>
                <thead>
                  <tr>
                    <th>IF YOU ARE…</th>
                    <th>TAKE</th>
                    <th>STARTS</th>
                    <th>DURATION</th>
                    <th>FEE FROM</th>
                  </tr>
                </thead>
                <tbody>
                  {fitRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.who}</td>
                      <td>
                        <b>{r.take}</b>
                      </td>
                      <td>{r.starts}</td>
                      <td>{r.duration}</td>
                      <td>{r.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {settings.coursesIncludePoints.length > 0 ? (
        <section className="ds-sec">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">What every course includes</h2>
                <p className="st">These are not paid add-ons. Whichever programme you join, all of this is covered by the fee.</p>
              </div>
            </div>
            <div className="ds-dlist">
              {settings.coursesIncludePoints.map((i) => (
                <div key={i}>
                  <i>✓</i> {i}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.coursesCtaHeading}</h2>
            <p>{settings.coursesCtaNote}</p>
            <div className="pts">
              {settings.coursesCtaPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Talk to a counsellor"
            note="We will call you back, usually the same day."
          />
        </div>
      </section>
    </>
  );
}
