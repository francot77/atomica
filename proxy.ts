import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api/push');

  if (!isDashboard && !isProtectedApi) {
    return NextResponse.next();
  }

  const session = req.cookies.get('admin_session')?.value;

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/appointments/:path*',
    '/api/services/:path*',
    '/api/push/:path*',
  ],
};
