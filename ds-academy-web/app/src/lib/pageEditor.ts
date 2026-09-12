import type { Permission } from '@/lib/rbac';

export type PageEditorLink = {
  label: string;
  href: string;
  permission: Permission;
  /** Present = Pro-only, hidden on the Elite tier (mirrors NavItem). */
  module?: string;
};

export type PageEditorGroup = {
  page: string;
  /** URL slug under /admin/page-editor/ — drill-down: names first, click one to see its links. */
  slug: string;
  note?: string;
  links: PageEditorLink[];
};

/**
 * One entry per public-site page, listing every place its content is
 * actually edited — the full CRUD managers that used to have their own
 * sidebar entries, plus the small per-page copy managers added during the
 * panel-connection audit. Each link is its own dedicated small page (not an
 * anchor into a shared form), except for a handful of genuinely site-wide
 * fields (contact info, social links, branding, SEO defaults) which still
 * live on the plain /admin/settings page — that page no longer carries any
 * single page's CTA/hero copy. Built so staff have exactly one place to
 * start from ("Page Editor") instead of hunting across a scattered sidebar.
 */
export const PAGE_EDITOR: PageEditorGroup[] = [
  {
    page: 'Home',
    slug: 'home',
    links: [
      { label: 'Hero banners', href: '/admin/banners', permission: 'banners' },
      { label: 'Toppers (shared with Results)', href: '/admin/toppers', permission: 'toppers' },
      { label: 'Stats strip', href: '/admin/settings/stats', permission: 'settings' },
      { label: 'Why choose us (shared with About) — each point can have its own card photo', href: '/admin/settings/why', permission: 'settings' },
      { label: 'Testimonials', href: '/admin/settings/testimonials', permission: 'settings' },
      { label: '"DS Stars" marquee copy', href: '/admin/settings/home-stars-marquee', permission: 'settings' },
      { label: 'Offer popup', href: '/admin/settings/home-offer-popup', permission: 'settings' },
      { label: "From the Director's Desk banner", href: '/admin/settings/home-director-desk', permission: 'settings' },
      { label: 'Admissions CTA copy', href: '/admin/settings/home-admissions-cta', permission: 'settings' },
    ],
  },
  {
    page: 'Courses',
    slug: 'courses',
    links: [
      { label: 'Courses & exams', href: '/admin/courses', permission: 'courses' },
      { label: 'Course packages', href: '/admin/packages', permission: 'packages', module: 'packages' },
      { label: 'Which course is for you? (comparison table)', href: '/admin/settings/course-fit', permission: 'settings' },
      { label: 'Header stats, checklist & bottom CTA copy', href: '/admin/settings/courses-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Results',
    slug: 'results',
    links: [
      { label: 'Toppers (shared with Home)', href: '/admin/toppers', permission: 'toppers' },
      { label: 'Stat numbers (Total / NEET / JEE / Years)', href: '/admin/settings/results-stats', permission: 'settings' },
      { label: 'Bottom admissions CTA copy', href: '/admin/settings/results-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Faculty',
    slug: 'faculty',
    links: [
      { label: 'Faculty members', href: '/admin/faculty', permission: 'faculty' },
      { label: '"Why this matters" cards', href: '/admin/settings/faculty-reasons', permission: 'settings' },
      { label: 'Header stat & bottom CTA copy', href: '/admin/settings/faculty-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Contact',
    slug: 'contact',
    links: [
      { label: 'Address, phone, WhatsApp, map', href: '/admin/settings#contact', permission: 'settings' },
      { label: 'Multi-branch centres', href: '/admin/branches', permission: 'branches', module: 'branches' },
    ],
  },
  {
    page: 'Admissions',
    slug: 'admissions',
    links: [
      { label: 'How admission works (steps)', href: '/admin/settings/admissions', permission: 'settings' },
      { label: 'Who can join which batch (eligibility table)', href: '/admin/settings/eligibility', permission: 'settings' },
      { label: 'Hero, stats, checklist & bottom CTA copy', href: '/admin/settings/admissions-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Downloads',
    slug: 'downloads',
    links: [
      { label: 'Files', href: '/admin/downloads', permission: 'downloads' },
      { label: '"How we do this" cards', href: '/admin/settings/download-highlights', permission: 'settings' },
      { label: 'Bottom CTA copy', href: '/admin/settings/downloads-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Facilities',
    slug: 'facilities',
    links: [
      { label: 'Facilities', href: '/admin/settings/facilities', permission: 'settings' },
      { label: '"What we do about safety" cards', href: '/admin/settings/safety-points', permission: 'settings' },
      { label: 'Bottom CTA copy', href: '/admin/settings/facilities-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Gallery',
    slug: 'gallery',
    links: [
      { label: 'Photos & videos', href: '/admin/gallery', permission: 'gallery' },
      { label: 'Bottom CTA copy', href: '/admin/settings/gallery-copy', permission: 'settings' },
    ],
  },
  {
    page: 'About',
    slug: 'about',
    links: [
      { label: 'Institute story', href: '/admin/settings#institute', permission: 'settings' },
      { label: 'Why choose us (shared with Home)', href: '/admin/settings/why', permission: 'settings' },
      { label: 'Bottom CTA copy', href: '/admin/settings/about-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Founders',
    slug: 'founders',
    links: [{ label: 'Founders (photo, role, quote)', href: '/admin/founders', permission: 'settings' }],
  },
  {
    page: 'News & Notices',
    slug: 'news',
    links: [{ label: 'News & events', href: '/admin/news', permission: 'news' }],
  },
  {
    page: 'FAQ',
    slug: 'faq',
    links: [
      { label: 'Questions', href: '/admin/faq', permission: 'faq', module: 'faq' },
      { label: 'Bottom CTA copy', href: '/admin/settings/faq-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Blog',
    slug: 'blog',
    links: [{ label: 'Posts', href: '/admin/blog', permission: 'blog', module: 'blog' }],
  },
  {
    page: 'Book a Demo',
    slug: 'demo',
    links: [
      { label: '"What to expect" checklist', href: '/admin/settings/demo', permission: 'settings' },
      { label: '"How it works" steps', href: '/admin/settings/demo-steps', permission: 'settings' },
      { label: 'Intro lines & bottom CTA copy', href: '/admin/settings/demo-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Rank Predictor',
    slug: 'predictor',
    links: [
      { label: 'Cut-off data', href: '/admin/predictor', permission: 'predictor', module: 'predictor' },
      { label: 'Predictor questions', href: '/admin/settings/predictor-faqs', permission: 'settings' },
      { label: 'Explainer & bottom CTA copy', href: '/admin/settings/predictor-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Careers',
    slug: 'careers',
    links: [
      { label: 'Current openings', href: '/admin/settings/job-openings', permission: 'settings' },
      { label: '"Why work with us" cards', href: '/admin/settings/career-reasons', permission: 'settings' },
      { label: '"How to apply" steps', href: '/admin/settings/career-steps', permission: 'settings' },
      { label: 'Stats & bottom CTA copy', href: '/admin/settings/careers-copy', permission: 'settings' },
    ],
  },
  {
    page: 'Free Sample Test',
    slug: 'sample-test',
    links: [{ label: 'Sample test questions', href: '/admin/settings/sample-test-faqs', permission: 'settings' }],
  },
  {
    page: 'Site-wide',
    slug: 'site-wide',
    note: 'Not tied to one page — shows up in the header, footer, and everywhere else on the site.',
    links: [
      { label: 'Popups (choose which pages each one shows on)', href: '/admin/popups', permission: 'popups' },
      { label: 'Offer popup (Home only, the old single-offer popup)', href: '/admin/settings/home-offer-popup', permission: 'settings' },
      { label: 'Contact details', href: '/admin/settings#contact', permission: 'settings' },
      { label: 'Social links', href: '/admin/settings#social', permission: 'settings' },
      { label: 'Logo, favicon & colours', href: '/admin/settings#branding', permission: 'settings' },
      { label: 'SEO defaults', href: '/admin/settings#seo-defaults', permission: 'settings' },
    ],
  },
];
