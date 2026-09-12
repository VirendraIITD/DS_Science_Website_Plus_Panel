import Link from 'next/link';

import { whatsappLink, type Settings } from '@/lib/settings';

type FooterLink = { href: string; label: string };

export function Footer({ settings, isPro }: { settings: Settings; isPro: boolean }) {
  const year = new Date().getFullYear();
  const wa = whatsappLink(
    settings.whatsappNumber,
    `Hello ${settings.instituteName}, I would like to know about admissions.`,
  );

  const socials = [
    { href: settings.facebookUrl, label: 'Facebook' },
    { href: settings.instagramUrl, label: 'Instagram' },
    { href: settings.youtubeUrl, label: 'YouTube' },
    { href: settings.twitterUrl, label: 'X' },
    { href: settings.linkedinUrl, label: 'LinkedIn' },
    { href: settings.snapchatUrl, label: 'Snapchat' },
  ].filter((s) => s.href);

  // Only real, existing pages — grouped the way Allen groups its footer,
  // but with DS's own content (nothing invented, nothing Allen-specific).
  const aboutLinks: FooterLink[] = [
    { href: '/about', label: 'About Us' },
    { href: '/faculty', label: 'Faculty' },
    { href: '/facilities', label: 'Facilities' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/careers', label: 'Careers' },
  ];

  const coursesLinks: FooterLink[] = [
    { href: '/courses', label: 'All Courses' },
    { href: '/admissions', label: 'Admissions & Scholarship' },
    ...(isPro ? [{ href: '/demo', label: 'Book a Demo Class' }] : []),
    { href: '/downloads', label: 'Brochure & Syllabus' },
  ];

  const resultsLinks: FooterLink[] = [
    { href: '/results', label: 'Our Results' },
    { href: '/sample-test', label: 'Free Sample Test' },
    { href: '/news', label: 'News & Notices' },
    ...(isPro ? [{ href: '/blog', label: 'Blog' }] : []),
  ];

  const examInfoLinks: FooterLink[] = [
    ...(isPro ? [{ href: '/predictor', label: 'Rank Predictor' }] : []),
    ...(isPro ? [{ href: '/faq', label: 'FAQ' }] : []),
    { href: '/contact', label: 'Contact & Directions' },
    { href: '/admin', label: 'Staff Login' },
  ];

  const columns: { title: string; links: FooterLink[] }[] = [
    { title: 'About Us', links: aboutLinks },
    { title: 'Courses & Admissions', links: coursesLinks },
    { title: 'Results', links: resultsLinks },
    { title: 'Exam Information', links: examInfoLinks },
  ];

  return (
    <footer className="mt-16 bg-navy text-[#cdd6ea]">
      <div className="container-ds grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 border-b border-navy-600 pb-2 text-[14px] font-extrabold text-white">
              {col.title}
            </h4>
            <ul className="space-y-2 text-[13px]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact strip — real, settings-driven, Allen-style icon row. */}
      <div className="border-t border-navy-600 bg-navy-700/40">
        <div className="container-ds grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🏢</span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-navy-400">Visit Us</div>
              <div className="text-[13px] leading-5">{settings.address}</div>
            </div>
          </div>

          {settings.phones[0] ? (
            <div className="flex items-start gap-3">
              <span className="text-xl">📱</span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                  For Admission Enquiry
                </div>
                {settings.phones.map((p) => (
                  <a key={p} href={`tel:${p}`} className="block text-[13px] hover:text-white">
                    {p}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {wa ? (
            <div className="flex items-start gap-3">
              <span className="text-xl">🎧</span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-navy-400">Need Help?</div>
                <a href={wa} target="_blank" rel="noreferrer" className="text-[13px] hover:text-white">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          ) : null}

          {settings.emails[0] ? (
            <div className="flex items-start gap-3">
              <span className="text-xl">✉️</span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                  Send Us a Message
                </div>
                {settings.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="block text-[13px] hover:text-white">
                    {e}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-navy-600">
        <div className="container-ds flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="" className="h-10 w-10 rounded-full object-contain" />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2f4d9e] to-[#1a2c66] text-sm font-extrabold text-white">
                DS
              </span>
            )}
            <div>
              <div className="text-[14px] font-extrabold text-white">{settings.instituteName}</div>
              <div className="text-[12px] text-navy-400">{settings.tagline}</div>
            </div>
          </div>

          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-navy-700 px-3 py-1.5 text-[12px] text-white hover:bg-brand"
                >
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-navy-600">
        <div className="container-ds flex flex-col items-center justify-between gap-2 py-4 text-[12px] sm:flex-row">
          <p>
            © {year} {settings.instituteName}. All rights reserved.
          </p>
          <p className="text-[#8fa0c8]">Website &amp; admin panel powered by Mentora</p>
        </div>
      </div>
    </footer>
  );
}
