// import { db } from '@/lib/db';

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// /** Container health check — proves the app is up *and* the database answers. */
// export async function GET() {
//   try {
//     await db.$queryRaw`SELECT 1`;
//     return Response.json({ ok: true, db: 'up' });
//   } catch {
//     return Response.json({ ok: false, db: 'down' }, { status: 503 });
//   }
// }


import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;

    return Response.json({
      ok: true,
      db: 'up',
    });
  } catch (error) {
    console.error('[DB HEALTH CHECK] Database connection failed:', error);

    return Response.json(
      {
        ok: false,
        db: 'down',
        error: error instanceof Error? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
