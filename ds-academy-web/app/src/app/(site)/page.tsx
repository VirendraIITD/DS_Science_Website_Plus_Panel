import Link from 'next/link';

import { Hero } from '@/components/site/Hero';
import { LeadForm } from '@/components/site/LeadForm';
import { OfferPopup } from '@/components/site/OfferPopup';
import {
  CourseCards,
  NewsTicker,
  SectionHead,
  StatsStrip,
  Testimonials,
  ToppersStrip,
  WhyUs,
} from '@/components/site/Sections';
import { StarsMarquee } from '@/components/site/StarsMarquee';
import { TestimonialVideos } from '@/components/site/TestimonialVideos';
import { TopperPopup } from '@/components/site/TopperPopup';
import { cachedQuery } from '@/lib/cache';
import { cheapestPackagesByCourse } from '@/lib/courses';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 300;

// Home is the highest-traffic page, so its data is cached across requests
// (not just per-request) — was previously 7 fresh DB round-trips on every
// single visit, the single biggest contributor to the site feeling slow.
const getHomeData = cachedQuery(['home-page-data'], async () => {
  const [banners, stats, courseRows, toppers, why, testimonials, news, blogPosts] = await Promise.all([
    db.banner.findMany({ where: { status: 'LIVE' }, orderBy: { order: 'asc' } }),
    db.statItem.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 4 }),
    db.course.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 6 }),
    db.topper.findMany({
      where: { active: true, featured: true },
      orderBy: [{ order: 'asc' }, { year: 'desc' }],
      take: 20,
    }),
    db.whyPoint.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    // Video and text testimonials are split into two separate sections below
    // and each needs its own handful of rows, so this can't be capped at a
    // low number like 3 — that silently hid every testimonial past the 3rd
    // (by order), video or text, no matter how many an admin added.
    db.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 24 }),
    db.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
      take: 5,
    }),
    isPro()
      ? db.blogPost.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  const priceByCourse = await cheapestPackagesByCourse(courseRows.map((c) => c.id));
  const courses = courseRows.map((c) => ({ ...c, price: priceByCourse[c.id] ?? null }));

  return { banners, stats, courses, toppers, why, testimonials, news, blogPosts };
});

export default async function HomePage() {
  const [settings, { banners, stats, courses, toppers, why, testimonials, news, blogPosts }] = await Promise.all([
    getSettings(),
    getHomeData(),
  ]);

  // A photo is nice to have but not required — TestimonialVideos falls back
  // to an initials avatar, since a fabricated stand-in face for a real
  // person's testimonial isn't something we're willing to put on the site.
  const videoTestimonials = testimonials.filter((t) => t.youtubeId);
  const textTestimonials = testimonials.filter((t) => !t.youtubeId);

  const daysLeft = settings.offerPopupExpiry
    ? Math.ceil((new Date(settings.offerPopupExpiry).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <>
      {/* Only one popup fires per visit — the offer popup takes priority when it's on. */}
      {settings.offerPopupEnabled ? (
        <OfferPopup
          kicker={settings.offerPopupKicker}
          headline={settings.offerPopupHeadline}
          discount={settings.offerPopupDiscount}
          note={settings.offerPopupNote}
          ctaLabel={settings.offerPopupCtaLabel}
          ctaHref={settings.offerPopupCtaHref}
          daysLeft={daysLeft}
        />
      ) : (
        <TopperPopup
          toppers={toppers}
          storageKey="dsTopperPopupShown:home"
          kicker="🏆 Our best result yet"
          heading="Congratulations to our toppers!"
          note="Another year, another set of results Gangapur City is proud of."
        />
      )}

      <Hero slides={banners} fallbackTagline={settings.tagline} demoHref={isPro() ? '/demo' : '/admissions'} />

      <NewsTicker items={news} />

      <StatsStrip stats={stats} />

      {videoTestimonials.length > 0 ? (
        <section className="ds-sec">
          <div className="container-ds">
            <SectionHead
              title="Trusted by parents. Loved by students."
              sub="Hear it straight from the families who send their children here."
            />
            <TestimonialVideos items={videoTestimonials} />
          </div>
        </section>
      ) : null}

      {textTestimonials.length > 0 ? (
        <section className={videoTestimonials.length > 0 ? 'ds-sec alt' : 'ds-sec'}>
          <div className="container-ds">
            {videoTestimonials.length === 0 ? <SectionHead title="Trusted by parents. Loved by students." /> : null}
            <Testimonials items={textTestimonials} />
          </div>
        </section>
      ) : null}

      {toppers.length > 0 ? (
        <section className={videoTestimonials.length > 0 || textTestimonials.length > 0 ? 'ds-sec alt' : 'ds-sec'}>
          <div className="container-ds">
            <SectionHead
              title="Our recent selections"
              sub="Students from Gangapur City who made it."
              href="/results"
              linkLabel="Full results"
            />
            <ToppersStrip toppers={toppers} />
          </div>
        </section>
      ) : null}

      <StarsMarquee
        stars={toppers}
        heading={settings.starsHeading}
        subheading={settings.starsSubheading}
        ctaLabel={settings.starsCtaLabel}
        ctaHref={settings.starsCtaHref}
      />

      <section className="ds-sec">
        <div className="container-ds">
          <SectionHead
            title="What we teach"
            sub="Every course runs with senior faculty in each subject and a weekly test cycle."
            href="/courses"
            linkLabel="All courses"
          />
          <CourseCards courses={courses} />
        </div>
      </section>

      {blogPosts.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <SectionHead title="Blogs" href="/blog" linkLabel="All articles" />
            <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '6px' }}>
              {blogPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="ds-bcard"
                  style={{ flex: '0 0 260px' }}
                >
                  <div className="top">
                    {p.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverUrl} alt="" />
                    ) : null}
                    <span className="tg">{p.category.toUpperCase()}</span>
                  </div>
                  <div className="body">
                    <h3>{p.title}</h3>
                    <div className="meta">{shortDate(p.publishedAt ?? p.createdAt)}</div>
                    {p.excerpt ? <p>{p.excerpt}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={blogPosts.length > 0 ? 'ds-sec' : 'ds-sec alt'}>
        <div className="container-ds">
          <SectionHead title="Why parents choose us" />
          <WhyUs points={why} />
        </div>
      </section>

      {settings.directorDeskEnabled ? (
        <section className={blogPosts.length > 0 ? 'ds-sec alt' : 'ds-sec'}>
          <div className="container-ds">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                background: 'linear-gradient(135deg, #1a2f60, #0f2149)',
                borderRadius: '16px',
                padding: '28px 32px',
                color: '#fff',
                flexWrap: 'wrap',
              }}
            >
              {settings.directorDeskPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.directorDeskPhotoUrl}
                  alt=""
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--ds-gold)' }}
                />
              ) : null}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{settings.directorDeskHeading}</h3>
                {settings.directorDeskNote ? (
                  <p style={{ marginTop: '4px', fontSize: '13.5px', color: 'rgba(255,255,255,0.75)' }}>{settings.directorDeskNote}</p>
                ) : null}
              </div>
              <Link href={settings.directorDeskCtaHref || '/founders'} className="ds-btn gold sm">
                {settings.directorDeskCtaLabel || 'Meet our founders'}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.admHeading}</h2>
            <p>{settings.admNote}</p>
            <div className="pts">
              {settings.admPoints.map((pt) => (
                <div key={pt}>
                  <i>✓</i> {pt}
                </div>
              ))}
            </div>

            {settings.phones[0] ? (
              <p className="mt-6 text-[14px] text-white/70">
                Or call{' '}
                <a href={`tel:${settings.phones[0]}`} className="font-bold text-white hover:underline">
                  {settings.phones[0]}
                </a>
              </p>
            ) : null}
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
