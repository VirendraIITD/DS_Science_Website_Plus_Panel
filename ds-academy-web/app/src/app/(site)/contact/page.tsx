import type { Metadata } from 'next';
import Link from 'next/link';

import { LeadForm } from '@/components/site/LeadForm';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings, siteUrl, whatsappLink } from '@/lib/settings';
import { isPro } from '@/lib/tier';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'Contact Us',
    description: `Address, phone and directions for ${s.instituteName}, ${s.city}.`,
    alternates: { canonical: '/contact' },
  };
}

const getContactPageData = cachedQuery(
  ['contact-page-data'],
  () =>
    Promise.all([
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
      isPro()
        ? db.branch.findMany({ where: { status: { not: 'CLOSED' } }, orderBy: { order: 'asc' } })
        : Promise.resolve([]),
      isPro() ? db.faq.findMany({ where: { active: true }, orderBy: { order: 'asc' }, take: 5 }) : Promise.resolve([]),
    ]),
  600,
);

export default async function ContactPage() {
  const [settings, [courses, branches, faqs]] = await Promise.all([getSettings(), getContactPageData()]);

  const wa = whatsappLink(settings.whatsappNumber, 'Hello, I have a question about admissions.');

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Contact</div>
          <h1>Come and see the place</h1>
          <p>
            A website can only tell you so much. Walk in any working day — no appointment needed. Or
            leave your number below and we will call you back, usually the same day.
          </p>
          <div className="facts">
            {settings.officeHours ? (
              <div>
                <b>{settings.officeHours}</b>
                <span>Working hours</span>
              </div>
            ) : null}
            <div>
              <b>Same day</b>
              <span>Callback, usually</span>
            </div>
            <div>
              <b>No appointment</b>
              <span>Just walk in</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds ds-2col" style={{ alignItems: 'start' }}>
          <div>
            <div className="ds-wcard" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '18px' }}>
                {settings.instituteName}
              </h3>

              <div className="irow" style={{ display: 'flex', gap: '15px', marginBottom: '18px' }}>
                <div style={{ fontSize: '19px' }}>📍</div>
                <div>
                  <b style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '0.7px' }}>
                    ADDRESS
                  </b>
                  <div style={{ fontSize: '14px', color: '#39435c', marginTop: '3px' }}>{settings.address}</div>
                </div>
              </div>

              {settings.phones.length > 0 ? (
                <div className="irow" style={{ display: 'flex', gap: '15px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '19px' }}>📞</div>
                  <div>
                    <b style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '0.7px' }}>
                      PHONE
                    </b>
                    <div style={{ fontSize: '14px', marginTop: '3px' }}>
                      {settings.phones.map((p, i) => (
                        <span key={p}>
                          {i > 0 ? <br /> : null}
                          <a href={`tel:${p}`} style={{ color: 'var(--ds-blue)', fontWeight: 700 }}>
                            {p}
                          </a>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.emails.length > 0 ? (
                <div className="irow" style={{ display: 'flex', gap: '15px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '19px' }}>✉️</div>
                  <div>
                    <b style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '0.7px' }}>
                      EMAIL
                    </b>
                    <div style={{ fontSize: '14px', marginTop: '3px' }}>
                      {settings.emails.map((e) => (
                        <a key={e} href={`mailto:${e}`} style={{ color: 'var(--ds-blue)', fontWeight: 700, wordBreak: 'break-all' }}>
                          {e}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {wa ? (
                <div className="irow" style={{ display: 'flex', gap: '15px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '19px' }}>💬</div>
                  <div>
                    <b style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '0.7px' }}>
                      WHATSAPP
                    </b>
                    <a href={wa} target="_blank" rel="noreferrer" style={{ color: 'var(--ds-blue)', fontWeight: 700, fontSize: '14px' }}>
                      Chat with us on WhatsApp
                    </a>
                    <div style={{ fontSize: '12.5px', color: 'var(--ds-mut)' }}>Fastest for a quick question</div>
                  </div>
                </div>
              ) : null}

              {settings.officeHours ? (
                <div className="irow" style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '19px' }}>🕘</div>
                  <div>
                    <b style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '0.7px' }}>
                      WORKING HOURS
                    </b>
                    <div style={{ fontSize: '14px', color: '#39435c', marginTop: '3px' }}>{settings.officeHours}</div>
                  </div>
                </div>
              ) : null}
            </div>

            {settings.mapEmbed ? (
              <div
                style={{ marginTop: '20px', borderRadius: 'var(--ds-r)', overflow: 'hidden', border: '1px solid var(--ds-line)' }}
                dangerouslySetInnerHTML={{ __html: settings.mapEmbed }}
              />
            ) : null}

            {/* [PRO] Other centres (PRD §6.3). */}
            {branches.length > 1 ? (
              <div className="ds-wcard" style={{ marginTop: '20px', padding: '25px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '13px' }}>Our centres</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '13.5px' }}>
                  {branches.map((b) => (
                    <li key={b.id} style={{ borderBottom: '1px solid var(--ds-line)', paddingBottom: '13px' }}>
                      <b style={{ color: 'var(--ds-navy)' }}>{b.name}</b>
                      <p style={{ marginTop: '2px', color: 'var(--ds-mut)' }}>{b.address || b.city}</p>
                      {b.phone ? (
                        <a href={`tel:${b.phone}`} style={{ color: 'var(--ds-blue)' }}>
                          {b.phone}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <Link href="/branches" className="ds-lnk" style={{ marginTop: '9px', display: 'inline-block' }}>
                  All centres →
                </Link>
              </div>
            ) : null}
          </div>

          <div>
            <LeadForm
              courses={courses.map((c) => c.name)}
              heading="Send us a message"
              note="We reply to every enquiry, usually the same day."
            />

            {settings.phones[0] ? (
              <div
                style={{
                  marginTop: '20px',
                  background: '#fdf3dd',
                  border: '1px solid #f0dca8',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#7a5800' }}>📞 Prefer to just call?</h4>
                <p style={{ fontSize: '13.5px', color: '#8a6a20', marginTop: '9px', lineHeight: 1.68 }}>
                  Admissions counter is open through the day. Ask for the counsellor and they will
                  explain fees, batches and the scholarship test in one call — no need to visit first.
                </p>
                <a href={`tel:${settings.phones[0]}`} className="ds-btn gold sm" style={{ marginTop: '15px' }}>
                  Call {settings.phones[0]}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <h2 className="t">Common questions before visiting</h2>
                <p className="st" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                  If yours is not here, just call — we would rather answer than have you guess.
                </p>
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
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/faq" className="ds-btn lineb">
                See all questions →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Local SEO (PRD §9). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: settings.instituteName,
            description: settings.tagline,
            url: siteUrl(),
            telephone: settings.phones[0] || undefined,
            email: settings.emails[0] || undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: settings.address,
              addressLocality: settings.city,
              addressRegion: settings.state,
              postalCode: settings.pincode || undefined,
              addressCountry: 'IN',
            },
          }),
        }}
      />
    </>
  );
}
