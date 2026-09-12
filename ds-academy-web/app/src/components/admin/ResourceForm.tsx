'use client';

import { PhotoUploadField } from '@/components/admin/PhotoUploadField';
import { UploadField } from '@/components/admin/UploadField';
import type { Field, ManagerRow } from '@/components/admin/types';

/** Renders one field of the shared admin form. */
export function ResourceField({
  field,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
}) {
  const id = `f_${field.name}`;
  const common = { id, name: field.name, 'aria-invalid': error ? true : undefined };

  return (
    <div className={field.full ? 'sm:col-span-2' : ''}>
      <label className="lbl" htmlFor={id}>
        {field.label}
      </label>

      {(() => {
        switch (field.type) {
          case 'textarea':
          case 'richtext':
            return (
              <textarea
                {...common}
                className="inp"
                rows={field.rows ?? (field.type === 'richtext' ? 12 : 3)}
                placeholder={field.placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            );

          case 'list':
            return (
              <textarea
                {...common}
                className="inp"
                rows={field.rows ?? 4}
                placeholder={field.placeholder ?? 'One per line'}
                value={Array.isArray(value) ? (value as string[]).join('\n') : String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value.split('\n'))}
              />
            );

          case 'number':
            return (
              <input
                {...common}
                type="number"
                className="inp"
                placeholder={field.placeholder}
                value={value === null || value === undefined ? '' : String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            );

          case 'select':
            return (
              <select
                {...common}
                className="inp"
                value={String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                {field.placeholder ? <option value="">{field.placeholder}</option> : null}
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );

          case 'multiselect': {
            const selected = Array.isArray(value) ? (value as string[]) : [];
            return (
              <div className="flex flex-wrap gap-2 pt-1">
                {field.options?.map((o) => {
                  const on = selected.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${
                        on
                          ? 'border-navy bg-navy text-white'
                          : 'border-line bg-white text-mut hover:border-brand hover:text-brand'
                      }`}
                      onClick={() =>
                        onChange(
                          field.name,
                          on ? selected.filter((x) => x !== o.value) : [...selected, o.value],
                        )
                      }
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            );
          }

          case 'checkbox':
            return (
              <label className="flex cursor-pointer items-center gap-2 pt-1.5 text-[13px]">
                <input
                  {...common}
                  type="checkbox"
                  className="h-4 w-4 accent-[#2563eb]"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(field.name, e.target.checked)}
                />
                <span className="text-mut">{field.help ?? 'Yes'}</span>
              </label>
            );

          case 'date':
          case 'datetime':
            return (
              <input
                {...common}
                type={field.type === 'date' ? 'date' : 'datetime-local'}
                className="inp"
                value={String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            );

          case 'color':
            return (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`${field.label} picker`}
                  className="h-[38px] w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                  value={String(value || '#0f2149')}
                  onChange={(e) => onChange(field.name, e.target.value)}
                />
                <input
                  {...common}
                  className="inp"
                  value={String(value ?? '')}
                  onChange={(e) => onChange(field.name, e.target.value)}
                />
              </div>
            );

          case 'photo':
            return (
              <PhotoUploadField
                value={String(value ?? '')}
                onChange={(url) => onChange(field.name, url)}
                onMeta={(m) => onChange('__meta_' + field.name, m)}
              />
            );

          case 'image':
          case 'file':
            return (
              <UploadField
                kind={field.type}
                value={String(value ?? '')}
                onChange={(url) => onChange(field.name, url)}
                onMeta={(m) => onChange('__meta_' + field.name, m)}
                aspect={field.aspect}
                outputLong={field.cropMaxPx}
              />
            );

          case 'password':
            return (
              <input
                {...common}
                type="password"
                className="inp"
                autoComplete="new-password"
                placeholder={field.placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            );

          default:
            return (
              <input
                {...common}
                className="inp"
                placeholder={field.placeholder}
                value={String(value ?? '')}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            );
        }
      })()}

      {field.help && field.type !== 'checkbox' ? (
        <span className="mt-1 block text-[11.5px] text-mut">{field.help}</span>
      ) : null}
      {error ? <span className="err">{error}</span> : null}
    </div>
  );
}

/** Seeds an empty form from the field list. */
export function blankRow(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.defaultValue !== undefined) out[f.name] = f.defaultValue;
    else if (f.type === 'checkbox') out[f.name] = false;
    else if (f.type === 'list' || f.type === 'multiselect') out[f.name] = [];
    else if (f.type === 'number') out[f.name] = 0;
    else if (f.type === 'select') out[f.name] = f.options?.[0]?.value ?? '';
    else out[f.name] = '';
  }
  return out;
}

/** Copies a DB row into form state, normalising dates for the inputs. */
export function rowToForm(fields: Field[], row: ManagerRow): Record<string, unknown> {
  const out: Record<string, unknown> = { id: row.id };
  for (const f of fields) {
    const raw = row[f.name];
    if (f.type === 'date' || f.type === 'datetime') {
      out[f.name] = raw ? isoForInput(String(raw), f.type) : '';
    } else if (f.type === 'password') {
      out[f.name] = '';
    } else if (f.type === 'list' || f.type === 'multiselect') {
      out[f.name] = Array.isArray(raw) ? raw : [];
    } else if (f.type === 'checkbox') {
      out[f.name] = Boolean(raw);
    } else {
      out[f.name] = raw ?? '';
    }
  }
  return out;
}

function isoForInput(iso: string, type: 'date' | 'datetime') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return type === 'date' ? date : `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
