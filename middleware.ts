import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Set up next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass middleware for API, static, and internal files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // First, let next-intl handle the locale routing
  const response = intlMiddleware(request);

  // Get the locale from the pathname after intl middleware processing
  const pathSegments = pathname.split("/").filter(Boolean);
  const possibleLocale = pathSegments[0];
  const locale = routing.locales.includes(possibleLocale as "en" | "ar")
    ? possibleLocale
    : routing.defaultLocale;

  // Remove locale prefix from pathname for auth checks
  const pathWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1)
    : pathname;

  const isAuthPage = ["/signin", "/signup", "/login", "/register"].some(
    (page) => pathWithoutLocale.startsWith(page) || pathWithoutLocale === page
  );

  const isProtectedPage = [
    "/account",
    "/dashboard",
    "/profile",
    "/settings",
    "/checkout",
  ].some(
    (page) => pathWithoutLocale.startsWith(page) || pathWithoutLocale === page
  );

  // Only do auth checks if we're on auth or protected pages
  if (isAuthPage || isProtectedPage) {
    try {
      const session = await auth();

      if (isAuthPage && session?.user) {
        // Authenticated user trying to access login/signup
        return NextResponse.redirect(
          new URL(`/${locale}/account`, request.url)
        );
      }

      if (isProtectedPage && !session?.user) {
        // Unauthenticated user trying to access protected route
        const redirectUrl = new URL(`/${locale}/signin`, request.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Middleware error:", error);
      if (isProtectedPage) {
        const fallbackUrl = new URL(`/${locale}/signin`, request.url);
        return NextResponse.redirect(fallbackUrl);
      }
    }
  }

  // Return the intl middleware response
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // Include the root path
    "/",
    // Include locale paths
    "/(ar|en)/:path*",
  ],
};
