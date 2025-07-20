
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Assume a user is not logged in if they don't have a session token cookie
  // Note: This is a simple check. A real app would verify the token's validity.
  const sessionToken = request.cookies.get('firebase-session-token');
 
  // Define protected paths
  const protectedWorkerPaths = [
      '/worker/dashboard',
      '/worker/earnings',
      '/worker/jobs',
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
      '/admin/register', // Protecting the register page as well
  ];
 
  const { pathname } = request.nextUrl;

  // If there's no session token and the user is trying to access a protected route
  if (!sessionToken) {
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

  // If user has a session token, but tries to access a login/register page,
  // we can redirect them to their respective dashboards.
  if (sessionToken) {
    if(pathname.startsWith('/worker/login') || pathname.startsWith('/worker/register')) {
      return NextResponse.redirect(new URL('/worker/dashboard', request.url))
    }
    if(pathname.startsWith('/household/login') || pathname.startsWith('/household/register')) {
      return NextResponse.redirect(new URL('/household/dashboard', request.url))
    }
    if(pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }
 
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/worker/:path*', '/household/:path*', '/admin/:path*'],
}
