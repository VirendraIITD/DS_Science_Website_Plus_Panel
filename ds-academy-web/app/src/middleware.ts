import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth-shared';

/**
 * Two jobs:
 *  1. Expose the pathname to server components (`x-pathname`), so the admin
 *     shell can highlight the current page and title the topbar.
 *  2. Bounce anonymous visitors away from /admin before any data is read.
 *     The session is *verified* in the layout — this is only a cheap gate.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const headers = new Headers(req.headers);
  headers.set('x-pathname', pathname);

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname.startsWith('/admin/login');

  if (isAdmin && !isLogin && !req.cookies.get(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|uploads|favicon.ico).*)'],
};
