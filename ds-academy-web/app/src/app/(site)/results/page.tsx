import type { Metadata } from 'next';
import Link from 'next/link';

import { HeroStarCarousel } from '@/components/site/HeroStarCarousel';
import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { TopperPopup } from '@/components/site/TopperPopup';
import { YearResultTable } from '@/components/site/YearResultTable';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { topperDisplayName } from '@/lib/format';
import { RankStrip } from '@/components/site/RankStrip';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

// Filtering (year/exam) happens in-memory below, against the full unfiltered
// list — so the raw query result is safe to cache regardless of searchParams.
const getResultsPageData = cachedQuery(['results-page-data'], async () => {
  const [all, courses, pyqDownloads] = await Promise.all([
    db.topper.findMany({
      where: { active: true },
      orderBy: [{ year: 'desc' }, { order: 'asc' }],
    }),
    db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    db.download.findMany({ where: { active: true, category: 'PYQ' }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);
  return { all, courses, pyqDownloads };
});

export const metadata: Metadata = {
  title: 'Results & Toppers',
  description: 'NEET and JEE selections from DS Science Academy, year by year.',
  alternates: { canonical: '/results' },
};

/** Filtering is done with links rather than JS so the pages stay indexable. */
export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { year?: string; exam?: string };
}) {
  const [{ all, courses, pyqDownloads }, settings] = await Promise.all([getResultsPageData(), getSettings()]);

  const years = [...new Set(all.map((t) => t.year))].sort((a, b) => b - a);
  const exams = [...new Set(all.map((t) => t.exam))].sort();

  const year = searchParams.year ? Number(searchParams.year) : null;
  const exam = searchParams.exam ?? null;

  const shown = all.filter(
    (t) => (!year || t.year === year) && (!exam || t.exam === exam),
  );

  const qs = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const merged = { year: year ? String(year) : null, exam, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/results?${s}` : '/results';
  };

  // Filtered to one exam: just that exam's top result. On "All", show the
  // top NEET and top JEE topper together and let the carousel rotate
  // between them, instead of only ever surfacing whichever sorts first.
  const heroStars = exam
    ? shown.slice(0, 1)
    : (() => {
        const neet = shown.find((t) => t.exam.toUpperCase().includes('NEET'));
        const jee = shown.find((t) => t.exam.toUpperCase().includes('JEE'));
        const both = [neet, jee].filter((t): t is (typeof shown)[number] => Boolean(t));
        return both.length > 0 ? both : shown.slice(0, 1);
      })();

  // Each of these falls back to a live count from the Toppers list, but an
  // admin can override any of them (Admin › Results stat numbers) — not
  // every selection needs a Topper card uploaded for the number to be right.
  const totalStat = settings.resultsStatTotalOverride || String(all.length);
  const neetStat = settings.resultsStatNeetOverride || String(all.filter((t) => t.exam.toUpperCase().includes('NEET')).length);
  const jeeStat = settings.resultsStatJeeOverride || String(all.filter((t) => t.exam.toUpperCase().includes('JEE')).length);
  const yearsStat = settings.resultsStatYearsOverride || String(years.length);

  const yearCounts = years.map((y) => ({ year: y, count: all.filter((t) => t.year === y).length }));
  const maxYearCount = Math.max(1, ...yearCounts.map((y) => y.count));

  return (
    <>
      <TopperPopup
        toppers={all.slice(0, 2)}
        storageKey="dsTopperPopupShown:results"
        kicker="🏆 Our best result yet"
        heading="Congratulations to our toppers!"
        note="Every name here studied in these classrooms."
      />

      <div className="ds-hero">
        <div className="ds-bgimg" />
        <div className="ds-wrap" style={{ display: 'grid', gridTemplateColumns: heroStars.length ? '1.25fr .9fr' : '1fr', gap: '44px', alignItems: 'center' }}>
          <div>
            <span className="kicker">🏆 Our results, year on year</span>
            <h1>
              {totalStat} selections{years[0] ? <> in {years[0]}</> : null}.
              <br />
              All of them from <span>Gangapur City</span>.
            </h1>
            <p className="ds-sub">
              Not a franchise, not a branch of anyone. Every student on this page walked into the same
              building, sat in the same classrooms, and wrote the same Sunday tests.
            </p>
            <div className="ds-cta">
              <a className="ds-btn gold" href="#full">
                See the full list
              </a>
              <a className="ds-btn line" href="#keys">
                Answer keys &amp; solutions
              </a>
            </div>
          </div>

          <HeroStarCarousel stars={heroStars} />
        </div>
      </div>

      <div className="ds-stats">
        <div className="g">
          <div className="s">
            <div className="n">{totalStat}</div>
            <div className="l">Total selections</div>
          </div>
          <div className="s">
            <div className="n">{neetStat}</div>
            <div className="l">NEET selections</div>
          </div>
          <div className="s">
            <div className="n">{jeeStat}</div>
            <div className="l">JEE selections</div>
          </div>
          <div className="s">
            <div className="n">
              {yearsStat}
              <em>+</em>
            </div>
            <div className="l">Years of results</div>
          </div>
        </div>
      </div>

      {all.length === 0 ? (
        <section className="ds-sec">
          <div className="container-ds">
            <EmptyState icon="🏆" text="Results will be published here after the next session." />
          </div>
        </section>
      ) : (
        <>
          {yearCounts.length > 1 ? (
            <section className="ds-sec">
              <div className="container-ds">
                <div className="ds-head">
                  <div>
                    <h2 className="t">Year by year</h2>
                    <p className="st">How selections have moved across the years we have results for.</p>
                  </div>
                </div>
                <div className="ds-tgrid" style={{ gridTemplateColumns: `repeat(${Math.min(yearCounts.length, 4)}, 1fr)` }}>
                  {yearCounts.map((yc, i) => (
                    <div key={yc.year} className="ds-wcard" style={{ textAlign: 'center', position: 'relative' }}>
                      {i === 0 ? (
                        <span
                          style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: '#e6f6ed',
                            color: 'var(--ds-ok)',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '20px',
                          }}
                        >
                          BEST YEAR
                        </span>
                      ) : null}
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '1.2px' }}>{yc.year}</div>
                      <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--ds-navy)', letterSpacing: '-1.2px', lineHeight: 1, marginTop: '8px' }}>
                        {yc.count}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--ds-mut)', marginTop: '5px' }}>selections</div>
                      <div style={{ height: '6px', borderRadius: '6px', background: 'var(--ds-bg)', marginTop: '15px', overflow: 'hidden' }}>
                        <i
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${Math.round((yc.count / maxYearCount) * 100)}%`,
                            background: 'linear-gradient(90deg, var(--ds-gold), #f4c151)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="ds-sec alt">
            <div className="container-ds">
              <div className="ds-head">
                <div>
                  <h2 className="t">Our toppers</h2>
                  <p className="st">Filter by year or exam. Every name here is a student who studied at DS Science Academy.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <div className="ds-filters" style={{ marginBottom: 0 }}>
                  <span style={{ alignSelf: 'center', fontSize: '11.5px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '1.1px', marginRight: '2px' }}>
                    YEAR
                  </span>
                  <Link href={qs({ year: null })} className={!year ? 'on' : ''}>
                    All
                  </Link>
                  {years.map((y) => (
                    <Link key={y} href={qs({ year: String(y) })} className={year === y ? 'on' : ''}>
                      {y}
                    </Link>
                  ))}
                </div>

                <div className="ds-filters" style={{ marginBottom: 0 }}>
                  <span style={{ alignSelf: 'center', fontSize: '11.5px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '1.1px', marginRight: '2px' }}>
                    EXAM
                  </span>
                  <Link href={qs({ exam: null })} className={!exam ? 'on' : ''}>
                    All
                  </Link>
                  {exams.map((e) => (
                    <Link key={e} href={qs({ exam: e })} className={exam === e ? 'on' : ''}>
                      {e}
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '13.5px', color: 'var(--ds-mut)', marginBottom: '18px' }}>
                Showing <b style={{ color: 'var(--ds-navy)' }}>{shown.length}</b> of {all.length} selections
              </div>

              {shown.length === 0 ? (
                <EmptyState icon="🔍" text="No selections match that filter." />
              ) : (
                <div className="ds-tgrid">
                  {shown.map((t) => {
                    const name = topperDisplayName(t.name);
                    return (
                    <article key={t.id} className="ds-tcard">
                      <span className="yr">{t.year}</span>
                      {t.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photoUrl} alt={name} className="av" />
                      ) : (
                        <div className="av">
                          {name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )}
                      <h4>{name}</h4>
                      <div className="ex">{t.exam}</div>
                      <RankStrip exam={t.exam} rankOrScore={t.rankOrScore} categoryRank={t.categoryRank} />
                      {t.address ? <div className="bt">{t.address}</div> : null}
                    </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="ds-sec" id="full">
            <div className="container-ds">
              <div className="ds-head">
                <div>
                  <h2 className="t">Complete result list</h2>
                  <p className="st">Every selection, year by year.</p>
                </div>
              </div>
              <YearResultTable rows={all} years={years} />
            </div>
          </section>
        </>
      )}

      {pyqDownloads.length > 0 ? (
        <section className="ds-sec alt" id="keys">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">Answer keys &amp; video solutions</h2>
                <p className="st">Published within hours of the paper. Free for everyone — you do not have to be our student to use these.</p>
              </div>
              <Link href="/downloads" className="ds-lnk">
                All past papers →
              </Link>
            </div>
            <div className="ds-cgrid">
              {pyqDownloads.map((d) => (
                <div key={d.id} className="ds-ccard">
                  <div
                    className="top"
                    style={{
                      background: 'linear-gradient(135deg, #1a2f60, #0f2149)',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '10.5px',
                      letterSpacing: '1px',
                    }}
                  >
                    VIDEO COMING SOON
                  </div>
                  <div className="body">
                    <h3>{d.title}</h3>
                    <div className="meta">{d.fileSizeKb ? `${(d.fileSizeKb / 1024).toFixed(1)} MB` : ''}</div>
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ds-lnk"
                      style={{ marginTop: '15px', display: 'inline-block' }}
                    >
                      Download PDF ↓
                    </a>
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
            <h2>{settings.resultsAdmHeading}</h2>
            <p>{settings.resultsAdmNote}</p>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Request a callback"
            note="Two fields is all we need."
          />
        </div>
      </section>
    </>
  );
}
