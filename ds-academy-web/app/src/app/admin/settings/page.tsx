import { SettingsForm } from '@/components/admin/SettingsForm';
import { requirePermission } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { SITE_WIDE_GROUPS } from '@/lib/settingsGroups';

export const dynamic = 'force-dynamic';

/** Genuinely site-wide config only — every page's own CTA/copy lives in its own small page, see Page Editor. */
export default async function SettingsPage() {
  await requirePermission('settings');
  const settings = await getSettings();

  return <SettingsForm settings={settings as never} groups={SITE_WIDE_GROUPS} />;
}
