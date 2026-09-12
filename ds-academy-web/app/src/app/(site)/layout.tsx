import type { ReactNode } from 'react';

import { Footer } from '@/components/site/Footer';
import { Header, type NavLink } from '@/components/site/Header';
import { SitePopup } from '@/components/site/SitePopup';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings, whatsappLink } from '@/lib/settings';
import { isPro } from '@/lib/tier';

const getActivePopups = cachedQuery(['site-popups'], () =>
  db.popup.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
);

// Cascades to every page under (site): render on each request instead of
// prerendering at build time. The Docker build image has no DB access
// (Railway doesn't forward service Variables into the build stage), and
// nearly every page here queries the DB (settings, courses, news, ...), so
// build-time static generation isn't viable — this also means admin-panel
// edits show up immediately instead of waiting for a rebuild.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, popups] = await Promise.all([getSettings(), getActivePopups()]);

  // Small, fixed set that always fits in one row — everything else lives
  // behind "More" so the header never overflows no matter how many pages
  // the site grows to (bit us once already: 14 links + Apply Now in one
  // unbroken flex row pushed the whole page into horizontal scroll).
  const primaryLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/results', label: 'Results' },
    { href: '/faculty', label: 'Faculty' },
  ];

  // Pro-only pages simply do not appear in the menu on an Elite install.
  // Contact moved here (out of the primary row) to make room without
  // reintroducing the header-overflow bug (see the comment above).
  const moreLinks: NavLink[] = [
    { href: '/about', label: 'About' },
    { href: '/facilities', label: 'Facilities' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/downloads', label: 'Downloads' },
    { href: '/news', label: 'News' },
    { href: '/sample-test', label: 'Sample Test' },
    { href: '/founders', label: 'Founders' },
    { href: '/contact', label: 'Contact' },
    ...(isPro()
      ? [
          { href: '/blog', label: 'Blog' },
          { href: '/predictor', label: 'Predictor' },
          { href: '/faq', label: 'FAQ' },
        ]
      : []),
  ];

  const wa = whatsappLink(
    settings.whatsappNumber,
    `Hello ${settings.instituteName}, I would like to know about admissions.`,
  );

  return (
    <>
      <Header
        primaryLinks={primaryLinks}
        moreLinks={moreLinks}
        instituteName={settings.instituteName}
        logoUrl={settings.logoUrl}
        phone={settings.phones[0] ?? ''}
        whatsapp={wa}
        demoHref={isPro() ? '/demo' : '/admissions'}
      />

      <main id="main">{children}</main>

      <Footer settings={settings} isPro={isPro()} />

      {wa ? <WhatsAppFab href={wa} /> : null}

      <SitePopup popups={popups} />
    </>
  );
}
