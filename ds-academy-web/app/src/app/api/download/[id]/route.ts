import { NextResponse } from 'next/server';

import { apiError, fail } from '@/lib/api';
import { db } from '@/lib/db';
import { siteUrl } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Counts a download, then redirects to the file. The Downloads manager shows
 * this count, which is how the institute learns which brochure actually works.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const file = await db.download.findUnique({ where: { id: params.id } });
    if (!file || !file.active) return fail('That file is no longer available.', 404);

    await db.download.update({
      where: { id: params.id },
      data: { downloadsCount: { increment: 1 } },
    });

    const target = file.fileUrl.startsWith('http') ? file.fileUrl : siteUrl(file.fileUrl);
    return NextResponse.redirect(target, 302);
  } catch (err) {
    return apiError(err);
  }
}
