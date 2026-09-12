import type { Metadata } from 'next';

import { SampleTestFlow } from '@/components/site/SampleTestFlow';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Free Sample Test',
  description: 'Try a free JEE or NEET sample test — subject-wise or a full mock, OTP verified.',
  alternates: { canonical: '/sample-test' },
};

export default async function SampleTestPage() {
  const faqs = await db.sampleTestFaq.findMany({ where: { active: true }, orderBy: { order: 'asc' } });

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Free Sample Test</div>
          <h1>Try a free sample test</h1>
          <p>
            Pick your exam and test type — subject-wise or a full mock — and start. Real exam-pattern
            questions on DS Science Academy&apos;s official test portal, ready in under a minute.
          </p>
          <div className="facts">
            <div>
              <b>Free</b>
              <span>No charge, no account needed first</span>
            </div>
            <div>
              <b>Real pattern</b>
              <span>Same format as JEE / NEET</span>
            </div>
            <div>
              <b>OTP verified</b>
              <span>Just your mobile number</span>
            </div>
          </div>
        </div>
      </div>

      <SampleTestFlow />

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h2 className="t">Sample test questions</h2>
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
