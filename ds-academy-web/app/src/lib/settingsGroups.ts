import type { Field } from '@/components/admin/types';

export type SettingsGroup = { title: string; note?: string; fields: Field[] };

/**
 * Settings that are genuinely site-wide — shown in the header, footer, or
 * used as a fallback across multiple pages. Rendered on the plain
 * /admin/settings page.
 *
 * Everything else (a single page's CTA copy, hero text, stats) lives in its
 * own small page under /admin/settings/<slug>, reachable only from the Page
 * Editor — see PAGE_SETTINGS_GROUPS below and src/lib/pageEditor.ts.
 */
export const SITE_WIDE_GROUPS: SettingsGroup[] = [
  {
    title: 'Institute',
    fields: [
      { name: 'instituteName', label: 'Institute name', type: 'text' },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'about', label: 'About the institute', type: 'textarea', rows: 5, full: true, help: 'Shown on the home page and the About page.' },
    ],
  },
  {
    title: 'Contact',
    note: 'These appear in the header, the footer and on the Contact page.',
    fields: [
      { name: 'address', label: 'Address', type: 'text', full: true },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'state', label: 'State', type: 'text' },
      { name: 'pincode', label: 'PIN code', type: 'text' },
      { name: 'whatsappNumber', label: 'WhatsApp number', type: 'text', help: 'Digits with country code, e.g. 919999999999' },
      { name: 'phones', label: 'Phone numbers', type: 'list', help: 'One per line' },
      { name: 'emails', label: 'Email addresses', type: 'list', help: 'One per line' },
      { name: 'mapEmbed', label: 'Google Maps embed', type: 'textarea', rows: 3, full: true, help: 'Paste the <iframe> from Google Maps › Share › Embed a map.' },
      { name: 'officeHours', label: 'Office hours', type: 'text', full: true, help: 'Shown on the Contact page.' },
    ],
  },
  {
    title: 'Social',
    fields: [
      { name: 'facebookUrl', label: 'Facebook', type: 'text' },
      { name: 'instagramUrl', label: 'Instagram', type: 'text' },
      { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
      { name: 'twitterUrl', label: 'X / Twitter', type: 'text' },
      { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
      { name: 'snapchatUrl', label: 'Snapchat', type: 'text' },
    ],
  },
  {
    title: 'Branding',
    fields: [
      { name: 'logoUrl', label: 'Logo', type: 'photo' },
      { name: 'faviconUrl', label: 'Favicon', type: 'image' },
      { name: 'primaryColor', label: 'Primary colour', type: 'color' },
      { name: 'accentColor', label: 'Accent colour', type: 'color' },
    ],
  },
  {
    title: 'SEO defaults',
    note: 'Used when a page has nothing more specific of its own.',
    fields: [
      { name: 'seoTitle', label: 'Default page title', type: 'text', full: true },
      { name: 'seoDescription', label: 'Meta description', type: 'textarea', rows: 3, full: true },
      { name: 'seoKeywords', label: 'Keywords', type: 'text', full: true, help: 'Comma separated' },
      { name: 'ogImageUrl', label: 'Share image', type: 'image', full: true, help: 'Shown when the site is shared on WhatsApp or Facebook. 1200×630.', aspect: 1200 / 630 },
    ],
  },
];

/** One entry per small per-page settings page, keyed by its URL slug under /admin/settings/. */
export const PAGE_SETTINGS_GROUPS: Record<string, SettingsGroup> = {
  'home-admissions-cta': {
    title: 'Home page — Admissions CTA',
    note: 'The navy "Admissions are open" section at the bottom of the Home page.',
    fields: [
      { name: 'admHeading', label: 'Heading', type: 'text', full: true, placeholder: 'Admissions are open for 2026-27' },
      { name: 'admNote', label: 'Paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'admPoints', label: 'Checklist points', type: 'list', full: true, help: 'One per line — shown with a ✓ next to each.' },
    ],
  },
  'home-stars-marquee': {
    title: 'Home page — DS Stars marquee',
    note: 'The navy "DS Stars" moving video-story section on the home page. Card content (photo, name, exam, rank, story caption) comes from the Toppers manager — the "Story caption" field there is what shows on each card.',
    fields: [
      { name: 'starsHeading', label: 'Heading', type: 'text', placeholder: 'DS Stars' },
      { name: 'starsSubheading', label: 'Subheading', type: 'text', full: true, placeholder: 'Uncover the Journey to Rise and Shine' },
      { name: 'starsCtaLabel', label: 'Button label', type: 'text', placeholder: 'Watch Videos' },
      { name: 'starsCtaHref', label: 'Button link', type: 'text', placeholder: '/gallery' },
    ],
  },
  'home-offer-popup': {
    title: 'Home page — Offer popup',
    note: 'An Allen-style promo popup shown once per visit on the Home page. Leave off until there is a real offer to run.',
    fields: [
      { name: 'offerPopupEnabled', label: 'Show the offer popup', type: 'checkbox', defaultValue: false },
      { name: 'offerPopupKicker', label: 'Small badge text', type: 'text', placeholder: 'ALLEN ONLINE' },
      { name: 'offerPopupHeadline', label: 'Headline', type: 'text', full: true, placeholder: 'Days to NEET' },
      { name: 'offerPopupDiscount', label: 'Discount text', type: 'text', placeholder: '80% OFF' },
      { name: 'offerPopupExpiry', label: 'Offer valid till', type: 'date', help: 'Shows a countdown; leave blank to hide it.' },
      { name: 'offerPopupNote', label: 'Fine print', type: 'textarea', rows: 2, full: true, placeholder: '30% early bird offer + 50% cashback' },
      { name: 'offerPopupCtaLabel', label: 'Button text', type: 'text', placeholder: 'Enrol Now' },
      { name: 'offerPopupCtaHref', label: 'Button link', type: 'text', placeholder: '/admissions' },
    ],
  },
  'courses-copy': {
    title: 'Courses page',
    note: 'The header stats, "what every course includes" checklist, and the bottom CTA on the Courses listing page. The comparison table further down has its own manager — see "Which course is for you?" in the Courses page group.',
    fields: [
      { name: 'coursesStatBatchSize', label: 'Students per batch', type: 'text', placeholder: '40' },
      { name: 'coursesStatEnrolled', label: 'Students enrolled', type: 'text', placeholder: '2,500+' },
      { name: 'coursesStatSelections', label: 'Selections', type: 'text', placeholder: '184' },
      { name: 'coursesIncludePoints', label: '"What every course includes" checklist', type: 'list', full: true, help: 'One per line.' },
      { name: 'coursesCtaHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Still not sure which one?' },
      { name: 'coursesCtaNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'coursesCtaPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'results-copy': {
    title: 'Results page — Admissions CTA',
    note: 'The navy "Next year, your name could be on this page" section at the bottom of the Results page.',
    fields: [
      { name: 'resultsAdmHeading', label: 'Heading', type: 'text', full: true, placeholder: 'Next year, your name could be on this page.' },
      { name: 'resultsAdmNote', label: 'Paragraph', type: 'textarea', rows: 3, full: true },
    ],
  },
  'results-stats': {
    title: 'Results page — stat numbers',
    note: 'Total selections, NEET selections, JEE selections and Years of results, shown at the top of the Results page and on the home page hero. Leave any field blank to count it automatically from the Toppers list instead — not every selection needs a Topper card uploaded for the automatic count to work, but if you want a specific number shown, type it here.',
    fields: [
      { name: 'resultsStatTotalOverride', label: 'Total selections (blank = auto-count)', type: 'text', placeholder: 'e.g. 19' },
      { name: 'resultsStatNeetOverride', label: 'NEET selections (blank = auto-count)', type: 'text', placeholder: 'e.g. 19' },
      { name: 'resultsStatJeeOverride', label: 'JEE selections (blank = auto-count)', type: 'text', placeholder: 'e.g. 0' },
      { name: 'resultsStatYearsOverride', label: 'Years of results (blank = auto-count)', type: 'text', placeholder: 'e.g. 3' },
    ],
  },
  'home-director-desk': {
    title: "Home page — From the Director's Desk banner",
    note: 'A small banner on the home page that links through to the Founders page.',
    fields: [
      { name: 'directorDeskEnabled', label: 'Show this banner', type: 'checkbox', defaultValue: false },
      { name: 'directorDeskHeading', label: 'Heading', type: 'text', full: true, placeholder: "From the Director's Desk" },
      { name: 'directorDeskNote', label: 'Note', type: 'textarea', rows: 2, full: true },
      { name: 'directorDeskPhotoUrl', label: 'Photo', type: 'photo' },
      { name: 'directorDeskCtaLabel', label: 'Button text', type: 'text', placeholder: 'Meet our founders' },
      { name: 'directorDeskCtaHref', label: 'Button link', type: 'text', placeholder: '/founders' },
    ],
  },
  'faculty-copy': {
    title: 'Faculty page',
    note: 'The header stat and the bottom "Meet them before you decide" CTA on the Faculty page. The "Why this matters" cards further down have their own manager.',
    fields: [
      { name: 'facultyStatStudentsPerTeacher', label: 'Students per teacher', type: 'text', placeholder: '40' },
      { name: 'facultyAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Meet them before you decide.' },
      { name: 'facultyAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'facultyAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'careers-copy': {
    title: 'Careers page',
    note: 'The header stats and bottom "Become part of the team" CTA on the Careers page. Openings, "why work with us" cards, and the apply steps have their own managers.',
    fields: [
      { name: 'careersStatSince', label: 'Since (year)', type: 'text', placeholder: '2014' },
      { name: 'careersStatTeamSize', label: 'Team size', type: 'text', placeholder: '18+' },
      { name: 'careersAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Become part of the team.' },
      { name: 'careersAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'careersAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'predictor-copy': {
    title: 'Predictor page',
    note: 'The explainer text and the bottom "Want the full picture?" CTA on the Rank Predictor page. The FAQ list has its own manager.',
    fields: [
      { name: 'predictorNote', label: 'How to read this — explainer', type: 'textarea', rows: 4, full: true, help: 'The Safe / Moderate / Reach explainer shown below the predictor tool.' },
      { name: 'predictorAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Want the full picture?' },
      { name: 'predictorAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'predictorAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'demo-copy': {
    title: 'Demo page',
    note: 'The intro lines and the bottom "See a class before you commit" CTA on the Book-a-Demo page. "What to expect" and "How it works" have their own managers.',
    fields: [
      { name: 'demoIntro', label: 'Intro line', type: 'textarea', rows: 3, full: true, help: 'Shown under "What to expect" on the Book-a-Demo page.' },
      { name: 'demoParentNote', label: 'Bringing a parent?', type: 'textarea', rows: 3, full: true },
      { name: 'demoAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'See a class before you commit.' },
      { name: 'demoAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'demoAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'faq-copy': {
    title: 'FAQ page',
    note: 'The bottom "Got a question? Just ask" CTA on the FAQ page.',
    fields: [
      { name: 'faqAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Got a question? Just ask.' },
      { name: 'faqAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
    ],
  },
  'about-copy': {
    title: 'About page',
    note: 'The bottom "Come and check for yourself" CTA on the About page.',
    fields: [
      { name: 'aboutAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Come and check for yourself.' },
      { name: 'aboutAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'aboutAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
  'gallery-copy': {
    title: 'Gallery page',
    note: 'The bottom "Come and see it" CTA on the Gallery page.',
    fields: [
      { name: 'galleryAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Better still — come and see it.' },
      { name: 'galleryAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
    ],
  },
  'facilities-copy': {
    title: 'Facilities page',
    note: 'The bottom "Photos only say so much" CTA on the Facilities page. The safety cards have their own manager.',
    fields: [
      { name: 'facilitiesAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Photos only say so much.' },
      { name: 'facilitiesAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
    ],
  },
  'downloads-copy': {
    title: 'Downloads page',
    note: 'The bottom "Check your score" CTA on the Downloads page. The "How we do this" cards have their own manager.',
    fields: [
      { name: 'downloadsAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Solved the paper and want to check your score?' },
      { name: 'downloadsAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
    ],
  },
  'admissions-copy': {
    title: 'Admissions page',
    note: 'The hero, header stats, "what to bring" checklist, and the bottom CTA on the Admissions page. The eligibility table and the "How admission works" steps have their own managers.',
    fields: [
      { name: 'admissionsHeading', label: 'Hero heading', type: 'text', full: true, placeholder: 'Admissions 2026-27 are open' },
      { name: 'admissionsIntro', label: 'Hero paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'admissionsStatSeatsPerBatch', label: 'Seats per batch', type: 'text', placeholder: '40' },
      { name: 'admissionsStatFeeInstalments', label: 'Fee instalments', type: 'text', placeholder: '2 or 3' },
      { name: 'admissionsWhatToBring', label: '"What to bring" checklist', type: 'list', full: true, help: 'One per line.' },
      { name: 'admissionsAdmHeading', label: 'Bottom CTA — heading', type: 'text', full: true, placeholder: 'Start with a free demo class.' },
      { name: 'admissionsAdmNote', label: 'Bottom CTA — paragraph', type: 'textarea', rows: 3, full: true },
      { name: 'admissionsAdmPoints', label: 'Bottom CTA — checklist points', type: 'list', full: true, help: 'One per line.' },
    ],
  },
};
