import { SettingsForm } from '@/components/admin/SettingsForm';
import { requirePermission } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { PAGE_SETTINGS_GROUPS } from '@/lib/settingsGroups';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requirePermission('settings');
  const settings = await getSettings();

  return <SettingsForm settings={settings as never} groups={[PAGE_SETTINGS_GROUPS['gallery-copy']]} />;
}
