import 'server-only';

import type { z } from 'zod';

import { db } from '@/lib/db';
import type { Permission } from '@/lib/rbac';
import * as v from '@/lib/validation';
import { slugify } from '@/lib/format';

/**
 * One registry, every manager.
 *
 * The admin panel has 20-odd CRUD screens that differ only in fields and
 * ordering, so they share a single API route (`/api/admin/[resource]`) driven
 * by this table. New manager = one entry here + one page, no new endpoint.
 */
export type ResourceDef = {
  /** Prisma delegate key on the client. */
  model: keyof typeof db;
  schema: z.ZodTypeAny;
  permission: Permission;
  /** Module name for tier gating; omit for Elite-tier resources. */
  module?: string;
  orderBy?: Record<string, 'asc' | 'desc'>[];
  /** Columns scanned by the panel's search box. */
  search?: string[];
  /** Derive a unique slug from this field when the form leaves slug blank. */
  slugFrom?: string;
  /** Fixed Prisma `where` this resource is always scoped to (e.g. splitting one model into two admin views). */
  where?: Record<string, unknown>;
  label: string;
};

export const RESOURCES: Record<string, ResourceDef> = {
  // --- Elite ---------------------------------------------------------------
  toppers: {
    model: 'topper',
    schema: v.topperSchema,
    permission: 'toppers',
    orderBy: [{ order: 'asc' }, { year: 'desc' }],
    search: ['name', 'exam', 'rankOrScore'],
    label: 'Topper',
  },
  popups: {
    model: 'popup',
    schema: v.popupSchema,
    permission: 'popups',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    search: ['title', 'heading'],
    label: 'Popup',
  },
  courses: {
    model: 'course',
    schema: v.courseSchema,
    permission: 'courses',
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    search: ['name', 'tagline'],
    slugFrom: 'name',
    label: 'Course',
  },
  faculty: {
    model: 'faculty',
    schema: v.facultySchema,
    permission: 'faculty',
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    search: ['name', 'subject'],
    label: 'Faculty member',
  },
  founders: {
    model: 'founder',
    schema: v.founderSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['name', 'role'],
    label: 'Founder',
  },
  news: {
    model: 'news',
    schema: v.newsSchema,
    permission: 'news',
    orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
    search: ['title', 'body'],
    slugFrom: 'title',
    label: 'News item',
  },
  gallery: {
    model: 'galleryItem',
    schema: v.gallerySchema,
    permission: 'gallery',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    search: ['caption', 'album'],
    label: 'Gallery item',
  },
  downloads: {
    model: 'download',
    schema: v.downloadSchema,
    permission: 'downloads',
    orderBy: [{ createdAt: 'desc' }],
    search: ['title'],
    label: 'Download',
  },
  banners: {
    model: 'banner',
    schema: v.bannerSchema,
    permission: 'banners',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Banner',
  },
  stats: {
    model: 'statItem',
    schema: v.statSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['label'],
    label: 'Stat',
  },
  why: {
    model: 'whyPoint',
    schema: v.whyPointSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Why-choose-us point',
  },
  testimonials: {
    model: 'testimonial',
    schema: v.testimonialSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['name', 'quote'],
    label: 'Testimonial',
  },
  admissionSteps: {
    model: 'admissionStep',
    schema: v.admissionStepSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Admission step',
  },
  demoHighlights: {
    model: 'demoHighlight',
    schema: v.demoHighlightSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['text'],
    label: 'Demo highlight',
  },
  courseFitRows: {
    model: 'courseFitRow',
    schema: v.courseFitRowSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['who', 'take'],
    label: 'Course fit row',
  },
  facultyReasons: {
    model: 'facultyReason',
    schema: v.facultyReasonSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Faculty page reason',
  },
  eligibilityRows: {
    model: 'eligibilityRow',
    schema: v.eligibilityRowSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['batch', 'who'],
    label: 'Eligibility row',
  },
  jobOpenings: {
    model: 'jobOpening',
    schema: v.jobOpeningSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['position', 'department'],
    label: 'Job opening',
  },
  careerReasons: {
    model: 'careerReason',
    schema: v.careerReasonSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Careers page reason',
  },
  careerSteps: {
    model: 'careerStep',
    schema: v.careerStepSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Careers page step',
  },
  predictorFaqs: {
    model: 'predictorFaq',
    schema: v.predictorFaqSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['question'],
    label: 'Predictor page FAQ',
  },
  sampleTestFaqs: {
    model: 'sampleTestFaq',
    schema: v.sampleTestFaqSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['question'],
    label: 'Sample Test page FAQ',
  },
  demoSteps: {
    model: 'demoStep',
    schema: v.demoStepSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Demo page step',
  },
  downloadHighlights: {
    model: 'downloadHighlight',
    schema: v.downloadHighlightSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Downloads page highlight',
  },
  safetyPoints: {
    model: 'safetyPoint',
    schema: v.safetyPointSchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Facilities page safety point',
  },
  facilities: {
    model: 'facility',
    schema: v.facilitySchema,
    permission: 'settings',
    orderBy: [{ order: 'asc' }],
    search: ['title'],
    label: 'Facility',
  },
  enquiries: {
    model: 'enquiry',
    schema: v.enquiryAdminSchema,
    permission: 'enquiries',
    where: { NOT: { course: { startsWith: 'Career' } } },
    orderBy: [{ createdAt: 'desc' }],
    search: ['name', 'phone', 'email', 'course'],
    label: 'Enquiry',
  },
  careerApplications: {
    model: 'enquiry',
    schema: v.enquiryAdminSchema,
    permission: 'enquiries',
    where: { course: { startsWith: 'Career' } },
    orderBy: [{ createdAt: 'desc' }],
    search: ['name', 'phone', 'email', 'course'],
    label: 'Career application',
  },

  // --- Pro -----------------------------------------------------------------
  packages: {
    model: 'coursePackage',
    schema: v.packageSchema,
    permission: 'packages',
    module: 'packages',
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    search: ['title'],
    label: 'Package',
  },
  demos: {
    model: 'demoBooking',
    schema: v.demoAdminSchema,
    permission: 'demos',
    module: 'demos',
    orderBy: [{ date: 'desc' }],
    search: ['studentName', 'phone', 'course'],
    label: 'Demo booking',
  },
  blog: {
    model: 'blogPost',
    schema: v.blogSchema,
    permission: 'blog',
    module: 'blog',
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    search: ['title', 'category'],
    slugFrom: 'title',
    label: 'Article',
  },
  faqs: {
    model: 'faq',
    schema: v.faqSchema,
    permission: 'faq',
    module: 'faq',
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
    search: ['question', 'answer'],
    label: 'FAQ',
  },
  branches: {
    model: 'branch',
    schema: v.branchSchema,
    permission: 'branches',
    module: 'branches',
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    search: ['name', 'city'],
    label: 'Branch',
  },
  cutoffs: {
    model: 'predictorCutoff',
    schema: v.cutoffSchema,
    permission: 'predictor',
    module: 'predictor',
    orderBy: [{ year: 'desc' }, { closingRank: 'asc' }],
    search: ['college', 'exam', 'category', 'quota', 'state'],
    label: 'Cutoff row',
  },
};

export function getResource(name: string): ResourceDef | null {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}

/** Prisma delegate for a resource, typed loosely so one route can serve all. */
type Delegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
  delete: (args: unknown) => Promise<Record<string, unknown>>;
  count: (args?: unknown) => Promise<number>;
};

export function delegate(def: ResourceDef): Delegate {
  return db[def.model] as unknown as Delegate;
}

/** Builds a case-insensitive OR across the resource's search columns. */
export function searchWhere(def: ResourceDef, q: string) {
  if (!q || !def.search?.length) return {};
  return {
    OR: def.search.map((field) => ({
      [field]: { contains: q, mode: 'insensitive' as const },
    })),
  };
}

/** Ensures a unique slug when the form leaves it blank or it collides. */
export async function ensureSlug(
  def: ResourceDef,
  data: Record<string, unknown>,
  currentId?: string,
) {
  if (!def.slugFrom) return data;

  const base = slugify(String(data.slug || data[def.slugFrom] || '')) || 'item';
  const d = delegate(def);

  let candidate = base;
  for (let i = 2; i < 60; i++) {
    const clash = await d.findUnique({ where: { slug: candidate } });
    if (!clash || (currentId && clash.id === currentId)) break;
    candidate = `${base}-${i}`;
  }

  return { ...data, slug: candidate };
}
