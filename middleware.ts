import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/admin', '/cashier', '/menu', '/tables', '/reports'];
const authRoutes = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Read authToken from HTTP-only cookie (set by login API)
  const authToken = request.cookies.get('authToken')?.value;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup pages
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
