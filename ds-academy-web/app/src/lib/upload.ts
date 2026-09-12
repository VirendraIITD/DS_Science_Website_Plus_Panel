import 'server-only';

import { randomBytes } from 'node:crypto';
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { slugify } from '@/lib/format';

const MAX_MB = Number(process.env.UPLOAD_MAX_MB || 8);
const BUCKET = 'uploads';

// Built lazily, not at module load: `next build` bundles/evaluates this
// module while collecting page data for routes that import it (even ones
// that never call saveUpload), and Railway's build stage has no env vars —
// an eager createClient() here throws "supabaseUrl is required" at build
// time. See also (site)/layout.tsx for the same class of issue with Prisma.
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

export class UploadError extends Error {}

export type UploadKind = 'image' | 'file';

export type Uploaded = {
  url: string;
  sizeKb: number;
  name: string;
};

/**
 * Uploads to the Supabase Storage `uploads` bucket under `<yyyy-mm>/` and
 * returns its public URL.
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<Uploaded> {
  if (!file || file.size === 0) throw new UploadError('No file received.');

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_MB) {
    throw new UploadError(`File is ${sizeMb.toFixed(1)} MB; the limit is ${MAX_MB} MB.`);
  }

  const allowed = kind === 'image' ? IMAGE_TYPES : new Set([...IMAGE_TYPES, ...FILE_TYPES]);
  if (!allowed.has(file.type)) {
    throw new UploadError(`"${file.type || 'unknown'}" files are not allowed here.`);
  }

  const ext = (path.extname(file.name) || '').toLowerCase().slice(0, 10) || guessExt(file.type);
  const stem = slugify(path.basename(file.name, path.extname(file.name))).slice(0, 40) || 'upload';
  const folder = new Date().toISOString().slice(0, 7); // yyyy-mm
  const filename = `${stem}-${randomBytes(4).toString('hex')}${ext}`;
  const filePath = `${folder}/${filename}`;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new UploadError(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return {
    url: data.publicUrl,
    sizeKb: Math.round(file.size / 1024),
    name: file.name,
  };
}

function guessExt(mime: string) {
  return (
    {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    }[mime] || '.bin'
  );
}
