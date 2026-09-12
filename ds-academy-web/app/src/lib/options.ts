import type { Option } from '@/components/admin/types';

/** Dropdown option lists shared by the admin forms. */

export const COURSE_CATEGORY_OPTIONS: Option[] = [
  { value: 'NEET', label: 'GONEET WITH RBSE' },
  { value: 'JEE', label: 'GOJEE WITH RBSE' },
  { value: 'FOUNDATION', label: 'Nurture Your Knowledge WITH RBSE' },
  { value: 'BOARD', label: 'Board' },
];

export const CLASS_LEVEL_OPTIONS: Option[] = [
  { value: 'ELEMENTARY', label: 'Elementary' },
  { value: 'CLASS_6', label: 'Class VI' },
  { value: 'CLASS_7', label: 'Class VII' },
  { value: 'CLASS_8', label: 'Class VIII' },
  { value: 'CLASS_9', label: 'Class IX' },
  { value: 'CLASS_10', label: 'Class X' },
  { value: 'CLASS_11', label: 'Class XI' },
  { value: 'CLASS_12', label: 'Class XII' },
];

export const POPUP_TYPE_OPTIONS: Option[] = [
  { value: 'CONTENT', label: 'Content (heading, text, button)' },
  { value: 'IMAGE', label: 'Image only' },
];

/** Public-site pages a Popup can be attached to — mirrors the routes under src/app/(site). */
export const POPUP_PAGE_OPTIONS: Option[] = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'blog', label: 'Blog' },
  { value: 'branches', label: 'Branches' },
  { value: 'careers', label: 'Careers' },
  { value: 'contact', label: 'Contact' },
  { value: 'courses', label: 'Courses' },
  { value: 'demo', label: 'Book a Demo' },
  { value: 'downloads', label: 'Downloads' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'faq', label: 'FAQ' },
  { value: 'founders', label: 'Founders' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'news', label: 'News' },
  { value: 'predictor', label: 'Rank Predictor' },
  { value: 'results', label: 'Results' },
  { value: 'sample-test', label: 'Free Sample Test' },
];

export const PACKAGE_TYPE_OPTIONS: Option[] = [
  { value: 'RECORDED', label: 'Recorded' },
  { value: 'LIVE', label: 'Live' },
  { value: 'TEST_SERIES', label: 'Test Series' },
];

export const NEWS_TYPE_OPTIONS: Option[] = [
  { value: 'NOTICE', label: 'Notice' },
  { value: 'EVENT', label: 'Event' },
];

export const PUBLISH_OPTIONS: Option[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export const BANNER_STATUS_OPTIONS: Option[] = [
  { value: 'LIVE', label: 'Live' },
  { value: 'HIDDEN', label: 'Hidden' },
];

export const DOWNLOAD_CATEGORY_OPTIONS: Option[] = [
  { value: 'BROCHURE', label: 'Brochure' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'PYQ', label: 'Previous Year Paper' },
  { value: 'OTHER', label: 'Other' },
];

export const LEAD_STAGE_OPTIONS: Option[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'DEMO', label: 'Demo Booked' },
  { value: 'ADMITTED', label: 'Admitted' },
  { value: 'LOST', label: 'Lost' },
];

export const LEAD_SOURCE_OPTIONS: Option[] = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IMPORT', label: 'Imported' },
  { value: 'OTHER', label: 'Other' },
];

export const DEMO_MODE_OPTIONS: Option[] = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'CENTRE', label: 'At the centre' },
];

export const DEMO_STATUS_OPTIONS: Option[] = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'DONE', label: 'Done' },
  { value: 'NO_SHOW', label: 'No-show' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const BRANCH_STATUS_OPTIONS: Option[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SETUP', label: 'Setting up' },
  { value: 'CLOSED', label: 'Closed' },
];

export const ROLE_OPTIONS: Option[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin — full access' },
  { value: 'COUNSELLOR', label: 'Counsellor — leads & enquiries' },
  { value: 'EDITOR', label: 'Editor — website content' },
];

export const CHANNEL_OPTIONS: Option[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'SMS', label: 'SMS' },
];
