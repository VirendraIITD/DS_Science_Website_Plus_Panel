'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ResourceField } from '@/components/admin/ResourceForm';
import { useToast } from '@/components/admin/Toast';
import { SITE_WIDE_GROUPS, type SettingsGroup } from '@/lib/settingsGroups';

export function SettingsForm({
  settings,
  groups = SITE_WIDE_GROUPS,
}: {
  settings: Record<string, unknown>;
  /** Defaults to the site-wide groups (Institute/Contact/Social/Branding/SEO). Pass a single-group array for a per-page settings screen. */
  groups?: SettingsGroup[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<Record<string, unknown>>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField(name: string, value: unknown) {
    if (name.startsWith('__meta_')) return;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  }

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        toast(json.error || 'Could not save', 'bad');
        return;
      }

      toast('Settings saved');
      router.refresh();
    } catch {
      toast('Network error', 'bad');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.title}
          id={group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
          className="card scroll-mt-20"
        >
          <div className="card-title">{group.title}</div>
          {group.note ? <p className="mb-4 -mt-1 text-[12px] text-mut">{group.note}</p> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.fields.map((f) => (
              <ResourceField
                key={f.name}
                field={f}
                value={form[f.name]}
                error={errors[f.name]}
                onChange={setField}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button className="btn btn-ok shadow-pop" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}
