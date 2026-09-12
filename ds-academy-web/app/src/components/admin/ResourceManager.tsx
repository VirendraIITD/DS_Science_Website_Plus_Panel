'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { Modal } from '@/components/admin/Modal';
import { ResourceField, blankRow, rowToForm } from '@/components/admin/ResourceForm';
import { useToast } from '@/components/admin/Toast';
import type { Column, Field, ManagerRow } from '@/components/admin/types';
import { Pill } from '@/components/ui/Pill';
import { dateTime, maskPhone, rupees, shortDate } from '@/lib/format';

/**
 * The list + create/edit/delete screen shared by every table-shaped manager
 * (Toppers, Faculty, News, Downloads, Banners, FAQs, Branches, Blog, Cutoffs…).
 * Custom-layout modules — CRM kanban, Packages cards, Gallery grid — build on
 * the same API but render their own bodies.
 */
export function ResourceManager({
  resource,
  title,
  addLabel,
  fields,
  columns,
  rows,
  searchable = true,
  toolbar,
  emptyHint,
  readOnly = false,
}: {
  resource: string;
  title: string;
  addLabel?: string;
  fields: Field[];
  columns: Column[];
  rows: ManagerRow[];
  searchable?: boolean;
  toolbar?: ReactNode;
  emptyHint?: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const editing = Boolean(form.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)),
    );
  }, [rows, columns, query]);

  const setField = useCallback((name: string, value: unknown) => {
    // Uploads report size/name alongside the URL; downloads use it for fileSizeKb.
    if (name.startsWith('__meta_')) {
      const meta = value as { sizeKb: number };
      setForm((f) => ('fileSizeKb' in f ? { ...f, fileSizeKb: meta.sizeKb } : f));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  }, []);

  function openCreate() {
    setForm(blankRow(fields));
    setErrors({});
    setOpen(true);
  }

  function openEdit(row: ManagerRow) {
    setForm(rowToForm(fields, row));
    setErrors({});
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const id = form.id as string | undefined;
      const res = await fetch(id ? `/api/admin/${resource}/${id}` : `/api/admin/${resource}`, {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) {
          setErrors(json.fields);
          toast('Please fix the highlighted fields', 'bad');
        } else {
          toast(json.error || 'Could not save', 'bad');
        }
        return;
      }

      setOpen(false);
      toast(id ? 'Saved' : 'Added');
      router.refresh();
    } catch {
      toast('Network error — please try again', 'bad');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/${resource}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Delete failed');
      }
      setConfirmId(null);
      toast('Deleted');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'bad');
    }
  }

  // Esc closes the dialog.
  useEffect(() => {
    if (!open && !confirmId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setConfirmId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, confirmId]);

  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
        <span className="flex flex-wrap items-center gap-2">
          {toolbar}
          {!readOnly ? (
            <button className="btn" onClick={openCreate}>
              + {addLabel || 'Add'}
            </button>
          ) : null}
        </span>
      </div>

      {searchable && rows.length > 6 ? (
        <input
          className="inp mb-3 max-w-xs"
          placeholder="Search in this list…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={`Search ${title}`}
        />
      ) : null}

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-mut">
          <div className="mb-2 text-4xl">📭</div>
          <p className="text-[13.5px]">
            {rows.length === 0 ? emptyHint || 'Nothing here yet.' : 'No rows match that search.'}
          </p>
        </div>
      ) : (
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="tbl">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={c.className}>
                    {c.header}
                  </th>
                ))}
                {!readOnly ? <th className="w-px" /> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-canvas/60">
                  {columns.map((c) => (
                    <td key={c.key} className={c.className}>
                      <Cell column={c} value={row[c.key]} />
                    </td>
                  ))}
                  {!readOnly ? (
                    <td className="whitespace-nowrap text-right">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>
                        Edit
                      </button>{' '}
                      <button
                        className="btn btn-ghost btn-sm !border-bad !text-bad"
                        onClick={() => setConfirmId(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={`${editing ? 'Edit' : 'Add'} ${addLabel || title}`}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-ok" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <ResourceField
              key={f.name}
              field={f}
              value={form[f.name]}
              error={errors[f.name]}
              onChange={setField}
            />
          ))}
        </div>
        {errors._ ? <p className="err mt-3">{errors._}</p> : null}
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        title="Delete this item?"
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={() => confirmId && remove(confirmId)}>
              Yes, delete
            </button>
          </>
        }
      >
        <p className="text-[13.5px] text-mut">
          This removes it from the website straight away. It cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function Cell({ column, value }: { column: Column; value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-mut">—</span>;
  }

  switch (column.kind) {
    case 'pill': {
      const key = String(value);
      return <Pill tone={column.tone?.[key] ?? 'b'}>{column.map?.[key] ?? key}</Pill>;
    }
    case 'date':
      return <>{shortDate(String(value))}</>;
    case 'datetime':
      return <>{dateTime(String(value))}</>;
    case 'money':
      return <>{rupees(Number(value))}</>;
    case 'number':
      return <>{Number(value).toLocaleString('en-IN')}</>;
    case 'phone':
      return <>{maskPhone(String(value))}</>;
    case 'bool':
      return value ? <Pill tone="g">Yes</Pill> : <Pill tone="n">No</Pill>;
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={String(value)}
          alt=""
          className="h-9 w-9 rounded-lg border border-line object-cover"
        />
      );
    case 'chips': {
      const items = Array.isArray(value) ? (value as string[]) : [String(value)];
      return (
        <span className="flex flex-wrap gap-1">
          {items.slice(0, 4).map((i) => (
            <span key={i} className="pill pill-n">
              {column.map?.[i] ?? i}
            </span>
          ))}
        </span>
      );
    }
    default:
      return <>{column.map?.[String(value)] ?? String(value)}</>;
  }
}
