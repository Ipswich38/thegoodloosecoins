import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EMERGENCY BLOCK: Redirect verify-otp requests immediately
  if (pathname.startsWith('/verify-otp')) {
    console.log('🚫 MIDDLEWARE BLOCKING VERIFY-OTP ACCESS - REDIRECTING TO SIGNUP');
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    url.search = '?message=Email+verification+is+disabled';
    return NextResponse.redirect(url);
  }

  // Skip middleware for static files, API routes, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname.startsWith('/legal')
  ) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Get auth tokens from cookies (support both Supabase and direct session)
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const directSession = request.cookies.get('app-session')?.value;
  const userId = request.cookies.get('user-id')?.value;

  // Simple authentication check - check if any valid tokens exist
  const isAuthenticated = !!(accessToken || (directSession && userId));

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // User is not authenticated and trying to access protected route
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    // User is already authenticated and trying to access auth routes
    // We can't easily determine user type here without database calls,
    // so we'll redirect to a generic dashboard and let the client handle routing
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/donor'; // Default, will be corrected by client-side logic
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};