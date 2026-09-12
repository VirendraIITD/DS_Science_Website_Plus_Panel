import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LeadForm } from '@/components/site/LeadForm';
import { PackageCards } from '@/components/site/PackageCards';
import { cachedQuery } from '@/lib/cache';
import { cheapestPackagesByCourse } from '@/lib/courses';
import { db } from '@/lib/db';
import { CATEGORY_LABEL, CLASS_LEVEL_LABEL, HIDDEN_CLASS_LEVELS } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

// Keyed by slug so each course gets its own cache entry, shared between
// generateMetadata and the page body below instead of querying twice.
const getCourseBySlug = (slug: string) =>
  cachedQuery(['course-detail', slug], () => db.course.findUnique({ where: { slug } }), 600)();

// No generateStaticParams(): these pages render on first request instead of
// at build time — the build image has no DB access (see Dockerfile), and
// static params would otherwise need a live DB connection during `next build`.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: 'Course not found' };

  return {
    title: course.name,
    description: course.description.slice(0, 160) || course.tagline,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);

  if (!course || !course.active) notFound();

  const [packages, otherCourses, settings] = await Promise.all([
    isPro()
      ? cachedQuery(
          ['course-packages', course.id],
          () =>
            db.coursePackage.findMany({
              where: { courseId: course.id, active: true },
              orderBy: [{ order: 'asc' }],
            }),
          600,
        )()
      : Promise.resolve([]),
    cachedQuery(
      ['course-others', course.id],
      () =>
        db.course.findMany({
          where: { active: true, id: { not: course.id } },
          orderBy: { order: 'asc' },
          take: 3,
        }),
      600,
    )(),
    getSettings(),
  ]);

  const priceByCourse = await cachedQuery(
    ['course-detail-pricing', course.id],
    () => cheapestPackagesByCourse([course.id, ...otherCourses.map((c) => c.id)]),
    600,
  )();
  const price = priceByCourse[course.id] ?? null;

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">
            Home &nbsp;›&nbsp; <Link href="/courses">Courses</Link> &nbsp;›&nbsp; {course.name}
          </div>
          <div className="pills">
            <span>{CATEGORY_LABEL[course.category] ?? course.category}</span>
            {course.classLevels
              .filter((l) => !HIDDEN_CLASS_LEVELS.includes(l))
              .map((l) => (
                <span key={l}>{(CLASS_LEVEL_LABEL[l] ?? l).toUpperCase()}</span>
              ))}
          </div>
          <h1>{course.name}</h1>
          {course.tagline ? <p>{course.tagline}</p> : null}
        </div>
      </div>

      <div className="container-ds">
        <div className="ds-lay">
          <main>
            {course.imageUrl ? (
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '30px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : null}

            {course.description ? (
              <>
                <h2 className="t">About this programme</h2>
                <div className="ds-prose" style={{ marginTop: '16px' }}>
                  {course.description
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>
              </>
            ) : null}

            {course.highlights.length > 0 ? (
              <>
                <h2 className="t" style={{ marginTop: '52px' }}>
                  What is included
                </h2>
                <p className="st" style={{ marginBottom: '20px' }}>
                  Everything below is covered by the fee. Nothing here is a paid add-on.
                </p>
                <div className="ds-dlist">
                  {course.highlights.map((h) => (
                    <div key={h}>
                      <i>✓</i> {h}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {otherCourses.length > 0 ? (
              <>
                <h2 className="t" style={{ marginTop: '52px' }}>
                  Other courses
                </h2>
                <div className="ds-rgrid" style={{ marginTop: '22px' }}>
                  {otherCourses.map((c) => {
                    const p = priceByCourse[c.id];
                    return (
                      <Link key={c.id} href={`/courses/${c.slug}`} className="ds-rcard">
                        <div className="top" />
                        <div className="b">
                          <h4>{c.name}</h4>
                          <div className="m">{c.tagline}</div>
                          {p && p.now > 0 ? (
                            <div className="p">
                              ₹{p.now.toLocaleString('en-IN')}
                              {p.was > p.now ? <small>₹{p.was.toLocaleString('en-IN')}</small> : null}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
          </main>

          <aside className="ds-side">
            <div className="ds-pbox">
              <div className="ptop">{course.category === 'NEET' ? <span className="ribbon">MOST ENROLLED</span> : null}</div>
              <div className="in">
                {price && price.now > 0 ? (
                  <>
                    <div className="amt">
                      <span className="now">₹{price.now.toLocaleString('en-IN')}</span>
                      {price.was > price.now ? (
                        <span className="was">₹{price.was.toLocaleString('en-IN')}</span>
                      ) : null}
                    </div>
                    {price.note ? <span className="save">{price.note}</span> : null}
                  </>
                ) : null}

                <div className="acts">
                  <Link href="/demo" className="ds-btn gold">
                    Book a free demo class
                  </Link>
                  <Link href="/contact" className="ds-btn navy">
                    Request a callback
                  </Link>
                  <Link href="/downloads" className="ds-btn lineb">
                    Download brochure (PDF)
                  </Link>
                </div>

                {course.highlights.length > 0 ? (
                  <ul>
                    {course.highlights.slice(0, 5).map((h) => (
                      <li key={h}>
                        <i>✓</i> {h}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {settings.phones[0] ? (
                  <div className="call">
                    Prefer to talk?
                    <br />
                    <a href={`tel:${settings.phones[0]}`}>📞 {settings.phones[0]}</a>
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <LeadForm
                courses={[course.name]}
                compact
                heading="Interested in this course?"
                note="Leave your number — we will call you back."
              />
            </div>
          </aside>
        </div>
      </div>

      {/* [PRO] Tiered packages (PRD §6.3). */}
      {isPro() && packages.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">Packages</h2>
                <p className="st">Pick the format that suits you. Prices include study material.</p>
              </div>
            </div>
            <PackageCards packages={JSON.parse(JSON.stringify(packages))} />
          </div>
        </section>
      ) : null}
    </>
  );
}
