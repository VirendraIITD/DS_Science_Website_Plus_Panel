import { apiError, fail, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { saveUpload } from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireUser();

    const form = await req.formData();
    const file = form.get('file');
    const kind = form.get('kind') === 'file' ? 'file' : 'image';

    if (!(file instanceof File)) return fail('No file received.', 400);

    const saved = await saveUpload(file, kind);
    return ok(saved);
  } catch (err) {
    return apiError(err);
  }
}
