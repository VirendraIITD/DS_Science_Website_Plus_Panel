import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FaqSearch } from '@/components/site/FaqSearch';
import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Batches, fees, scholarships, hostel — the questions parents ask us most.',
  alternates: { canonical: '/faq' },
};

const getFaqPageData = cachedQuery(
  ['faq-page-data'],
  () =>
    Promise.all([
      db.faq.findMany({
        where: { active: true },
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      }),
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    ]),
  600,
);

/** [PRO] FAQ accordion, built on <details> so it works without JavaScript. */
export default async function FaqPage() {
  if (!isPro()) notFound();

  const [[faqs, courses], settings] = await Promise.all([getFaqPageData(), getSettings()]);

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; FAQ</div>
          <h1>Questions people actually ask</h1>
          <p>
            Written the way the office answers them on the phone. If yours is not here, call — we
            would rather answer than have you guess.
          </p>
          <div className="facts">
            <div>
              <b>{faqs.length}</b>
              <span>Questions answered</span>
            </div>
            <div>
              <b>{categories.length}</b>
              <span>Topics</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {faqs.length === 0 ? (
            <EmptyState icon="❓" text="Questions and answers are being added." />
          ) : (
            <FaqSearch faqs={faqs} categories={categories} />
          )}

          {faqs.length > 0 ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                }),
              }}
            />
          ) : null}
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.faqAdmHeading}</h2>
            <p>{settings.faqAdmNote}</p>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Ask us anything"
            note="We reply to every enquiry, usually the same day."
          />
        </div>
      </section>
    </>
  );
}
