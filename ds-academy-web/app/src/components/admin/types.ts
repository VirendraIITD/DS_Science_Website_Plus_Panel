import type { PillTone } from '@/components/ui/Pill';

/**
 * Field and column descriptors are plain data so a server component can hand
 * them to the client `ResourceManager` without serialisation gymnastics.
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'image'
  | 'photo'
  | 'file'
  | 'list'
  | 'color'
  | 'password';

export type Option = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: Option[];
  placeholder?: string;
  help?: string;
  /** Span both form columns. */
  full?: boolean;
  rows?: number;
  defaultValue?: string | number | boolean | string[];
  /** 'image' fields only — width/height (e.g. 4/3, 16/9) to crop-preview to before upload. */
  aspect?: number;
  /** 'image' fields only — longest output side in px for the crop-preview export (default 720). Raise this for large full-bleed images like hero banners, where 720px looks visibly soft at full width. */
  cropMaxPx?: number;
};

export type ColumnKind =
  | 'text'
  | 'pill'
  | 'date'
  | 'datetime'
  | 'money'
  | 'number'
  | 'image'
  | 'bool'
  | 'phone'
  | 'chips';

export type Column = {
  key: string;
  header: string;
  kind?: ColumnKind;
  /** Enum value → readable label. */
  map?: Record<string, string>;
  /** Enum value → pill colour. */
  tone?: Record<string, PillTone>;
  className?: string;
};

export type ManagerRow = Record<string, unknown> & { id: string };
