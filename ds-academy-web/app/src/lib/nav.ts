import type { Permission } from '@/lib/rbac';
import { PAGE_SETTINGS_GROUPS } from '@/lib/settingsGroups';

/**
 * Admin sidebar, transcribed from the approved prototypes.
 * Elite shows the non-Pro entries in the Elite grouping; Pro shows all of them
 * in the wider Pro grouping (ds_panel_pro.html).
 */
export type NavItem = {
  href: string;
  label: string;
  icon: string;
  permission: Permission;
  /** Present = [PRO] badge + hidden on the Elite tier. */
  module?: string;
};

export type NavGroup = { section: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    section: 'MAIN',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '📊', permission: 'dashboard' },
      { href: '/admin/analytics', label: 'Analytics', icon: '📈', permission: 'analytics', module: 'analytics' },
      { href: '/admin/predictor', label: 'Rank Predictor', icon: '🎯', permission: 'predictor', module: 'predictor' },
    ],
  },
  {
    section: 'PAGE EDITOR',
    items: [
      { href: '/admin/page-editor', label: 'Page Editor', icon: '🖊️', permission: 'settings' },
    ],
  },
  {
    section: 'LEADS & GROWTH',
    items: [
      { href: '/admin/crm', label: 'Lead CRM', icon: '🧲', permission: 'crm', module: 'crm' },
      { href: '/admin/enquiries', label: 'Enquiries', icon: '📝', permission: 'enquiries' },
      { href: '/admin/demos', label: 'Demo Bookings', icon: '📞', permission: 'demos', module: 'demos' },
      { href: '/admin/broadcast', label: 'Broadcast', icon: '📢', permission: 'broadcast', module: 'broadcast' },
    ],
  },
  {
    section: 'INSTITUTE',
    items: [
      { href: '/admin/branches', label: 'Multi-Branch', icon: '🏢', permission: 'branches', module: 'branches' },
      { href: '/admin/staff', label: 'Staff & Roles', icon: '👥', permission: 'staff', module: 'staff' },
      { href: '/admin/activity-log', label: 'Activity Log', icon: '🕒', permission: 'staff' },
      { href: '/admin/career-applications', label: 'Career Applications', icon: '🧑‍💼', permission: 'enquiries' },
      { href: '/admin/tests', label: 'Tests / QBM', icon: '🧪', permission: 'dashboard' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙️', permission: 'settings' },
    ],
  },
];

/**
 * Routes that used to have their own sidebar entry (Toppers, Courses, Faculty,
 * News, Blog, Gallery, Downloads, FAQ, Banners, Packages) before they moved
 * into the Page Editor hub. Kept here only so the topbar still shows a real
 * title instead of falling back to "Dashboard" when one of these is open.
 */
const EXTRA_PAGE_TITLES: Record<string, string> = {
  '/admin/toppers': 'Toppers / Results',
  '/admin/popups': 'Popups',
  '/admin/courses': 'Courses & Exams',
  '/admin/packages': 'Course Packages',
  '/admin/faculty': 'Faculty',
  '/admin/news': 'News & Events',
  '/admin/blog': 'Blog',
  '/admin/gallery': 'Gallery',
  '/admin/downloads': 'Downloads',
  '/admin/faq': 'FAQ',
  '/admin/banners': 'Hero Banners',
};

/** Page titles for the topbar — mirrors the prototype's `titles` map. */
export const PAGE_TITLES: Record<string, string> = {
  ...EXTRA_PAGE_TITLES,
  ...Object.fromEntries(
    Object.entries(PAGE_SETTINGS_GROUPS).map(([slug, group]) => [`/admin/settings/${slug}`, group.title]),
  ),
  ...Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.href, i.label]))),
};
