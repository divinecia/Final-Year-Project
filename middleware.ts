
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware for basic path protection (Edge Runtime compatible)
export async function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // Check for session token (basic check only - full verification happens in components)
  const sessionCookie = request.cookies.get('firebase-session-token');
  const hasSession = sessionCookie && sessionCookie.value;

  // Define protected paths
  const protectedWorkerPaths = [
      '/worker/dashboard',
      '/worker/earnings',
      '/worker/jobs',
      '/worker/messaging',
      '/worker/notifications',
      '/worker/reviews',
      '/worker/schedule',
      '/worker/settings',
      '/worker/training',
  ];

  const protectedHouseholdPaths = [
      '/household/dashboard',
      '/household/bookings',
      '/household/find-worker',
      '/household/messaging',
      '/household/notifications',
      '/household/payments',
      '/household/post-job',
      '/household/reviews',
      '/household/settings',
  ];

  const protectedAdminPaths = [
      '/admin/dashboard',
      '/admin/households',
      '/admin/jobs',
      '/admin/packages',
      '/admin/payments',
      '/admin/reports',
      '/admin/settings',
      '/admin/training',
      '/admin/workers/workermanage',
      '/admin/register',
  ];

  // Redirect to appropriate login if no session and accessing protected paths
  if (!hasSession) {
    if (protectedWorkerPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/worker/login', request.url))
    }
    if (protectedHouseholdPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/household/login', request.url))
    }
    if (protectedAdminPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/worker/:path*', '/household/:path*', '/admin/:path*'],
}
