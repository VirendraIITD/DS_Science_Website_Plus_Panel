import 'server-only';

import { randomBytes } from 'node:crypto';
import path from 'node:path';

import { BlobServiceClient } from '@azure/storage-blob';

import { slugify } from '@/lib/format';

const MAX_MB = Number(process.env.UPLOAD_MAX_MB || 8);
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'uploads';

// Built lazily, not at module load, so `next build` (which has no env vars
// in some CI/Docker build stages) does not throw for routes that import this.
let _container: ReturnType<BlobServiceClient['getContainerClient']> | null = null;





function getContainer() {
  if (!_container) {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) throw new UploadError('AZURE_STORAGE_CONNECTION_STRING is not set.');
    
    try {
      _container = BlobServiceClient.fromConnectionString(conn).getContainerClient(CONTAINER);
    } catch (e) {
      // A malformed value (e.g. missing "DefaultEndpointsProtocol=https;") throws a
      // plain Error, which the API turns into an unhelpful generic 500.
      throw new UploadError(
        `AZURE_STORAGE_CONNECTION_STRING is invalid: ${e instanceof Error ? e.message : 'could not parse it'}. ` +
          'It must start with "DefaultEndpointsProtocol=https;AccountName=...".',
      );
    }

  }
  return _container;
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
 * Uploads to the Azure Blob Storage `uploads` container under `<yyyy-mm>/`
 * and returns its public URL.
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

  const blob = getContainer().getBlockBlobClient(filePath);
  try {
    await blob.uploadData(Buffer.from(await file.arrayBuffer()), {
      blobHTTPHeaders: { blobContentType: file.type, blobCacheControl: 'public, max-age=31536000, immutable' },
    });
  } catch (e) {
    throw new UploadError(e instanceof Error ? e.message : 'Upload failed.');
  }

  return {
    url: blob.url,
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
