import { z } from 'zod';

import { extractYouTubeId } from '@/lib/youtube';

/** Trimmed string that treats "" as absent for optional fields. */
const s = z.string().trim();
const opt = s.default('');
const url = s.default('');
const int = z.coerce.number().int();
const bool = z.coerce.boolean();
/** A pasted YouTube link or bare ID, normalised to a clean ID — anything
 * unrecognisable (a title, a stray phrase) is dropped to '' rather than
 * saved as-is. See lib/youtube.ts for why this exists. */
const youtubeIdField = s.default('').transform(extractYouTubeId);

const dateish = z
  .union([z.string(), z.date()])
  .nullish()
  .transform((v) => (v === '' || v === null || v === undefined ? null : new Date(v)));

/** Accepts a real array, or the newline/comma text the admin textareas post. */
const list = z
  .union([z.array(z.string()), z.string()])
  .default([])
  .transform((v) =>
    (Array.isArray(v) ? v : v.split(/\r?\n|,/))
      .map((x) => x.trim())
      .filter(Boolean),
  );

export const phoneSchema = s
  .min(10, 'Enter a valid phone number')
  .max(20)
  .regex(/^[0-9+\-\s()]+$/, 'Phone can only contain digits and + - ( )');

export const emailSchema = z.string().trim().email('Enter a valid email');

// ---------------------------------------------------------------------------
// Public forms
// ---------------------------------------------------------------------------

export const enquiryPublicSchema = z.object({
  name: s.min(2, 'Please enter your name').max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal('')]).default(''),
  course: opt,
  classOf: opt,
  city: opt,
  message: s.max(1000).default(''),
  // Honeypot — bots fill it, humans never see it (PRD §9 anti-spam).
  website: z.string().max(0).optional().default(''),
});

export const demoPublicSchema = z.object({
  studentName: s.min(2, 'Please enter the student name').max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal('')]).default(''),
  course: opt,
  date: z.string().min(1, 'Pick a date'),
  mode: z.enum(['ONLINE', 'CENTRE']).default('ONLINE'),
  branchId: s.optional(),
  notes: s.max(500).default(''),
  website: z.string().max(0).optional().default(''),
});

export const careerApplyPublicSchema = z.object({
  name: s.min(2, 'Please enter your name').max(80),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal('')]).default(''),
  position: opt,
  experience: s.max(300).default(''),
  website: z.string().max(0).optional().default(''),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ---------------------------------------------------------------------------
// Admin resources — one schema per manager
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  instituteName: s.min(2),
  tagline: opt,
  about: opt,
  address: opt,
  city: opt,
  state: opt,
  pincode: opt,
  phones: list,
  emails: list,
  whatsappNumber: opt,
  mapEmbed: opt,
  officeHours: opt,
  demoIntro: opt,
  demoParentNote: opt,
  predictorNote: opt,
  admHeading: opt,
  admNote: opt,
  admPoints: list,
  coursesStatBatchSize: opt,
  coursesStatEnrolled: opt,
  coursesStatSelections: opt,
  coursesIncludePoints: list,
  coursesCtaHeading: opt,
  coursesCtaNote: opt,
  coursesCtaPoints: list,
  resultsAdmHeading: opt,
  resultsAdmNote: opt,
  resultsStatTotalOverride: opt,
  resultsStatNeetOverride: opt,
  resultsStatJeeOverride: opt,
  resultsStatYearsOverride: opt,
  directorDeskEnabled: bool.default(false),
  directorDeskHeading: opt,
  directorDeskNote: opt,
  directorDeskPhotoUrl: url,
  directorDeskCtaLabel: opt,
  directorDeskCtaHref: opt,
  facultyStatStudentsPerTeacher: opt,
  facultyAdmHeading: opt,
  facultyAdmNote: opt,
  facultyAdmPoints: list,
  careersStatSince: opt,
  careersStatTeamSize: opt,
  careersAdmHeading: opt,
  careersAdmNote: opt,
  careersAdmPoints: list,
  predictorAdmHeading: opt,
  predictorAdmNote: opt,
  predictorAdmPoints: list,
  demoAdmHeading: opt,
  demoAdmNote: opt,
  demoAdmPoints: list,
  faqAdmHeading: opt,
  faqAdmNote: opt,
  aboutAdmHeading: opt,
  aboutAdmNote: opt,
  aboutAdmPoints: list,
  galleryAdmHeading: opt,
  galleryAdmNote: opt,
  facilitiesAdmHeading: opt,
  facilitiesAdmNote: opt,
  starsHeading: opt,
  starsSubheading: opt,
  starsCtaLabel: opt,
  starsCtaHref: opt,
  downloadsAdmHeading: opt,
  downloadsAdmNote: opt,
  admissionsHeading: opt,
  admissionsIntro: opt,
  admissionsStatSeatsPerBatch: opt,
  admissionsStatFeeInstalments: opt,
  admissionsWhatToBring: list,
  admissionsAdmHeading: opt,
  admissionsAdmNote: opt,
  admissionsAdmPoints: list,
  offerPopupEnabled: bool.default(false),
  offerPopupKicker: opt,
  offerPopupHeadline: opt,
  offerPopupDiscount: opt,
  offerPopupNote: opt,
  offerPopupCtaLabel: opt,
  offerPopupCtaHref: opt,
  offerPopupExpiry: dateish,
  facebookUrl: url,
  instagramUrl: url,
  youtubeUrl: url,
  twitterUrl: url,
  linkedinUrl: url,
  snapchatUrl: url,
  logoUrl: url,
  faviconUrl: url,
  primaryColor: s.regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #0f2149').default('#0f2149'),
  accentColor: s.regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #e0a11a').default('#e0a11a'),
  seoTitle: opt,
  seoDescription: opt,
  seoKeywords: opt,
  ogImageUrl: url,
});

export const courseSchema = z.object({
  name: s.min(2, 'Course name is required'),
  slug: opt,
  category: z.enum(['NEET', 'JEE', 'FOUNDATION', 'BOARD']),
  classLevels: z.union([z.array(z.enum(['ELEMENTARY', 'CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12', 'FOUNDATION'])), z.string()])
    .default([])
    .transform((v) => (Array.isArray(v) ? v : v ? [v] : [])),
  tagline: opt,
  description: opt,
  imageUrl: url,
  highlights: list,
  order: int.default(0),
  active: bool.default(true),
});

export const topperSchema = z
  .object({
    name: s.min(2, 'Name is required'),
    photoUrl: url,
    exam: s.min(1, 'Exam is required'),
    rankOrScore: opt,
    categoryRank: opt,
    year: int.min(1990).max(2100),
    address: opt,
    quote: opt,
    storyTag: opt,
    order: int.default(0),
    featured: bool.default(false),
    active: bool.default(true),
  })
  // A student can have just a category rank with no overall AIR yet (or
  // vice versa) — only reject a row with neither, not one missing either
  // column.
  .refine((d) => d.rankOrScore || d.categoryRank, {
    message: 'Enter a rank/score, a category rank, or both',
    path: ['rankOrScore'],
  });

export const facultySchema = z.object({
  name: s.min(2, 'Name is required'),
  photoUrl: url,
  subject: s.min(1, 'Subject is required'),
  qualification: opt,
  experienceYears: int.min(0).max(70).default(0),
  bio: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const newsSchema = z.object({
  title: s.min(3, 'Title is required'),
  slug: opt,
  type: z.enum(['NOTICE', 'EVENT']).default('NOTICE'),
  body: opt,
  imageUrl: url,
  date: dateish,
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  pinned: bool.default(false),
});

export const gallerySchema = z.object({
  imageUrl: s.min(1, 'Upload an image first'),
  caption: opt,
  album: s.default('General'),
  youtubeId: youtubeIdField,
  order: int.default(0),
  active: bool.default(true),
});

export const downloadSchema = z.object({
  title: s.min(2, 'Title is required'),
  category: z.enum(['BROCHURE', 'SYLLABUS', 'PYQ', 'OTHER']).default('BROCHURE'),
  fileUrl: s.min(1, 'Upload a file first'),
  fileSizeKb: int.min(0).default(0),
  active: bool.default(true),
});

export const bannerSchema = z.object({
  title: s.min(2, 'Title is required'),
  subtitle: opt,
  imageUrl: url,
  link: url,
  ctaLabel: opt,
  order: int.default(0),
  status: z.enum(['LIVE', 'HIDDEN']).default('LIVE'),
});

export const popupSchema = z.object({
  title: s.min(2, 'Title is required'),
  type: z.enum(['IMAGE', 'CONTENT']).default('CONTENT'),
  imageUrl: url,
  imageHref: url,
  heading: opt,
  body: opt,
  ctaLabel: opt,
  ctaHref: opt,
  pages: list,
  delaySeconds: int.min(0).max(60).default(2),
  order: int.default(0),
  active: bool.default(true),
});

export const statSchema = z.object({
  label: s.min(1),
  value: s.min(1),
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const whyPointSchema = z.object({
  title: s.min(2),
  body: opt,
  icon: opt,
  imageUrl: url,
  order: int.default(0),
  active: bool.default(true),
});

export const admissionStepSchema = z.object({
  title: s.min(2),
  body: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const demoHighlightSchema = z.object({
  text: s.min(2),
  order: int.default(0),
  active: bool.default(true),
});

export const courseFitRowSchema = z.object({
  who: s.min(2),
  take: s.min(1),
  starts: opt,
  duration: opt,
  fee: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const facultyReasonSchema = z.object({
  title: s.min(2),
  body: opt,
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const eligibilityRowSchema = z.object({
  batch: s.min(2),
  who: s.min(2),
  timing: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const jobOpeningSchema = z.object({
  position: s.min(2),
  department: opt,
  type: opt,
  experience: opt,
  status: opt,
  seatClass: z.enum(['few', 'ok', 'new']).default('ok'),
  filled: bool.default(false),
  order: int.default(0),
  active: bool.default(true),
});

export const careerReasonSchema = z.object({
  title: s.min(2),
  body: opt,
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const careerStepSchema = z.object({
  title: s.min(2),
  body: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const predictorFaqSchema = z.object({
  question: s.min(2),
  answer: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const sampleTestFaqSchema = z.object({
  question: s.min(2),
  answer: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const demoStepSchema = z.object({
  title: s.min(2),
  body: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const downloadHighlightSchema = z.object({
  title: s.min(2),
  body: opt,
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const safetyPointSchema = z.object({
  title: s.min(2),
  body: opt,
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const testimonialSchema = z.object({
  name: s.min(2),
  role: opt,
  photoUrl: url,
  quote: s.min(2, 'Quote is required'),
  youtubeId: youtubeIdField,
  thumbnailUrl: url,
  order: int.default(0),
  active: bool.default(true),
});

export const founderSchema = z.object({
  name: s.min(2, 'Name is required'),
  photoUrl: url,
  role: opt,
  quote: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const facilitySchema = z.object({
  title: s.min(2),
  description: opt,
  imageUrl: url,
  icon: opt,
  order: int.default(0),
  active: bool.default(true),
});

export const enquiryAdminSchema = z.object({
  name: s.min(2),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal('')]).default(''),
  course: opt,
  classOf: opt,
  city: opt,
  source: z.enum(['WEBSITE', 'WHATSAPP', 'WALK_IN', 'REFERRAL', 'PHONE', 'IMPORT', 'OTHER']).default('WEBSITE'),
  message: opt,
  stage: z.enum(['NEW', 'CONTACTED', 'DEMO', 'ADMITTED', 'LOST']).default('NEW'),
  assignedToId: s.nullish().transform((v) => v || null),
  followUpDate: dateish,
  branchId: s.nullish().transform((v) => v || null),
});

// --- Pro -------------------------------------------------------------------

export const packageSchema = z.object({
  courseId: s.min(1, 'Pick a course'),
  title: s.min(2, 'Title is required'),
  type: z.enum(['RECORDED', 'LIVE', 'TEST_SERIES']).default('RECORDED'),
  classLevel: z.enum(['ELEMENTARY', 'CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12', 'FOUNDATION']).default('CLASS_11'),
  startDate: dateish,
  durationLabel: opt,
  features: list,
  priceOriginal: int.min(0).default(0),
  priceDiscounted: int.min(0).default(0),
  discountPct: int.min(0).max(100).default(0),
  highlight: bool.default(false),
  order: int.default(0),
  active: bool.default(true),
});

export const demoAdminSchema = z.object({
  studentName: s.min(2),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal('')]).default(''),
  course: opt,
  date: dateish.refine((v) => v !== null, 'Date is required'),
  mode: z.enum(['ONLINE', 'CENTRE']).default('ONLINE'),
  status: z.enum(['UPCOMING', 'DONE', 'NO_SHOW', 'CANCELLED']).default('UPCOMING'),
  notes: opt,
  branchId: s.nullish().transform((v) => v || null),
});

export const blogSchema = z.object({
  title: s.min(3, 'Title is required'),
  slug: opt,
  category: s.default('General'),
  coverUrl: url,
  excerpt: opt,
  body: opt,
  seoTitle: opt,
  seoDescription: opt,
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  publishedAt: dateish,
});

export const faqSchema = z.object({
  question: s.min(3, 'Question is required'),
  answer: s.min(2, 'Answer is required'),
  category: s.default('General'),
  order: int.default(0),
  active: bool.default(true),
});

export const branchSchema = z.object({
  name: s.min(2, 'Branch name is required'),
  city: s.min(2, 'City is required'),
  address: opt,
  phone: opt,
  email: z.union([emailSchema, z.literal('')]).default(''),
  studentsCount: int.min(0).default(0),
  mapEmbed: opt,
  imageUrl: url,
  isMain: bool.default(false),
  status: z.enum(['ACTIVE', 'SETUP', 'CLOSED']).default('ACTIVE'),
  order: int.default(0),
});

export const cutoffSchema = z.object({
  exam: s.min(2, 'Exam is required'),
  college: s.min(2, 'College is required'),
  courseName: s.default('MBBS'),
  state: opt,
  category: s.default('General'),
  quota: s.default('All India'),
  closingRank: int.min(1, 'Closing rank must be at least 1'),
  year: int.min(1990).max(2100),
});

export const staffSchema = z.object({
  name: s.min(2, 'Name is required'),
  email: emailSchema,
  role: z.enum(['SUPER_ADMIN', 'COUNSELLOR', 'EDITOR']).default('EDITOR'),
  password: z.union([z.string().min(8, 'Password must be at least 8 characters'), z.literal('')]).default(''),
  active: bool.default(true),
  counsellingAccess: bool.default(false),
});

export const broadcastSchema = z.object({
  channel: z.enum(['WHATSAPP', 'SMS']).default('WHATSAPP'),
  segment: s.min(1, 'Pick a segment'),
  message: s.min(5, 'Message is too short').max(1000),
});

export const leadNoteSchema = z.object({
  enquiryId: s.min(1),
  body: s.min(1, 'Note cannot be empty').max(2000),
});

/** Flattens a ZodError into `{ field: message }` for the admin forms. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
