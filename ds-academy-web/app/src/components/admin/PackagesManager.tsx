'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Modal } from '@/components/admin/Modal';
import { ResourceField, blankRow, rowToForm } from '@/components/admin/ResourceForm';
import { useToast } from '@/components/admin/Toast';
import type { Field } from '@/components/admin/types';
import { CLASS_LEVEL_LABEL, PACKAGE_TYPE_LABEL, rupees, shortDate } from '@/lib/format';
import { CLASS_LEVEL_OPTIONS, PACKAGE_TYPE_OPTIONS } from '@/lib/options';

type Pkg = {
  id: string;
  courseId: string;
  title: string;
  type: string;
  classLevel: string;
  startDate: string | null;
  durationLabel: string;
  features: string[];
  priceOriginal: number;
  priceDiscounted: number;
  discountPct: number;
  highlight: boolean;
  order: number;
  active: boolean;
  course?: { name: string };
};

const BADGE: Record<string, string> = {
  RECORDED: 'bg-[#eef2ff] text-brand',
  LIVE: 'bg-[#fdeceb] text-bad',
  TEST_SERIES: 'bg-[#e6f6ed] text-ok',
};

/** [PRO] Course Packages — the prototype's tabbed pricing cards. */
export function PackagesManager({
  packages,
  courses,
}: {
  packages: Pkg[];
  courses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState('CLASS_11');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fields: Field[] = useMemo(
    () => [
      {
        name: 'courseId',
        label: 'Course',
        type: 'select',
        options: courses.map((c) => ({ value: c.id, label: c.name })),
      },
      { name: 'title', label: 'Package title', type: 'text', placeholder: 'NEET Achiever 11' },
      { name: 'type', label: 'Type', type: 'select', options: PACKAGE_TYPE_OPTIONS },
      { name: 'classLevel', label: 'Class level', type: 'select', options: CLASS_LEVEL_OPTIONS },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'durationLabel', label: 'Duration / start text', type: 'text', placeholder: 'Starts 1 Aug 2026' },
      { name: 'features', label: 'What is included', type: 'list', full: true, help: 'One per line — each becomes a tick on the card' },
      { name: 'priceOriginal', label: 'Original price (₹)', type: 'number' },
      { name: 'priceDiscounted', label: 'Discounted price (₹)', type: 'number' },
      { name: 'discountPct', label: 'Discount %', type: 'number', help: 'Shown as the green “20% OFF” tag' },
      { name: 'order', label: 'Card order', type: 'number' },
      { name: 'highlight', label: 'Highlight this card', type: 'checkbox' },
      { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true },
    ],
    [courses],
  );

  const shown = packages.filter((p) => p.classLevel === tab);

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const id = form.id as string | undefined;
      const res = await fetch(id ? `/api/admin/packages/${id}` : '/api/admin/packages', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        toast(json.error || 'Could not save', 'bad');
        return;
      }

      setOpen(false);
      toast(id ? 'Saved' : 'Package added');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
    setConfirmId(null);
    if (res.ok) {
      toast('Deleted');
      router.refresh();
    } else toast('Could not delete', 'bad');
  }

  if (courses.length === 0) {
    return (
      <div className="card">
        <p className="py-10 text-center text-[13.5px] text-mut">
          Add a course first — packages hang off a course.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        {CLASS_LEVEL_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setTab(o.value)}
            className={`rounded-full border px-4 py-[7px] text-[12.5px] font-semibold transition ${
              tab === o.value
                ? 'border-navy bg-navy text-white'
                : 'border-line bg-white text-mut hover:border-brand hover:text-brand'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <p className="py-10 text-center text-[13.5px] text-mut">
            No packages for {CLASS_LEVEL_LABEL[tab] ?? tab} yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-card border bg-white p-[17px] ${
                p.highlight ? 'border-purp' : 'border-line'
              } ${!p.active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className={`rounded-md px-[9px] py-[3px] text-[10px] font-extrabold tracking-wide ${BADGE[p.type]}`}>
                  {PACKAGE_TYPE_LABEL[p.type].toUpperCase()}
                </span>
                {!p.active ? <span className="pill pill-y">Hidden</span> : null}
              </div>

              <h4 className="mb-[3px] mt-2.5 text-[15.5px] font-bold">{p.title}</h4>
              <p className="text-[11.5px] text-mut">
                {p.course?.name} · {p.durationLabel || (p.startDate ? `Starts ${shortDate(p.startDate)}` : 'Rolling')}
              </p>

              <ul className="my-3 space-y-[3px] text-[12.5px]">
                {p.features.map((f) => (
                  <li key={f}>
                    <span className="font-extrabold text-ok">✓</span> {f}
                  </li>
                ))}
              </ul>

              <div className="text-[20px] font-extrabold text-navy">
                {p.priceOriginal > p.priceDiscounted ? (
                  <s className="mr-1.5 text-[13px] font-normal text-mut">{rupees(p.priceOriginal)}</s>
                ) : null}
                {rupees(p.priceDiscounted || p.priceOriginal)}
                {p.discountPct > 0 ? (
                  <span className="ml-1.5 text-[11px] font-bold text-ok">{p.discountPct}% OFF</span>
                ) : null}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  className="btn btn-sm flex-1"
                  onClick={() => {
                    setForm(rowToForm(fields, p as never));
                    setErrors({});
                    setOpen(true);
                  }}
                >
                  Edit Package
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5">
        <button
          className="btn"
          onClick={() => {
            setForm({ ...blankRow(fields), classLevel: tab, courseId: courses[0].id });
            setErrors({});
            setOpen(true);
          }}
        >
          + Add Package
        </button>
      </div>

      <Modal
        open={open}
        title={form.id ? 'Edit package' : 'Add package'}
        onClose={() => setOpen(false)}
        wide
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
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
              onChange={(name, value) => {
                setForm((s) => ({ ...s, [name]: value }));
                setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
              }}
            />
          ))}
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        title="Delete this package?"
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
        <p className="text-[13.5px] text-mut">It disappears from the course page immediately.</p>
      </Modal>
    </>
  );
}
