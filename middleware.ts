import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getLocale } from 'next-intl/server';

// Set up next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass middleware for API, static, and internal files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Get locale from URL
  const locale = await getLocale();

  // Remove locale prefix from pathname
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  const isAuthPage = ['/signin', '/signup', '/login', '/register'].some((page) =>
    pathWithoutLocale.startsWith(page)
  );

  const isProtectedPage = ['/account', '/dashboard', '/profile', '/settings', '/checkout'].some((page) =>
    pathWithoutLocale.startsWith(page)
  );

  try {
    const session = await auth();

    if (isAuthPage && session?.user) {
      // Authenticated user trying to access login/signup
      return NextResponse.redirect(new URL(`/${locale}/account`, request.url));
    }

    if (isProtectedPage && !session?.user) {
      // Unauthenticated user trying to access protected route
      const redirectUrl = new URL(`/${locale}/signin`, request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    if (isProtectedPage) {
      const fallbackUrl = new URL(`/${locale}/signin`, request.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // Apply next-intl locale routing
  return intlMiddleware(request);
}

// Configure which paths the middleware should run on
export const config = {
  // Match both auth pages and protected pages
  matcher: [
    // next-intl global matcher
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    // your specific auth + protected routes (for faster routing)

    "/signin/:path*",
    "/signup/:path*",
    "/login/:path*",
    "/register/:path*",
    "/account/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/checkout/:path*",
  ],
};
