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

  // Check for admin routes
  const isAdminPage = pathWithoutLocale.startsWith("/admin");

  if (isAuthPage || isProtectedPage || isAdminPage) {
    try {
      const session = await auth();

      // Redirect authenticated users away from auth pages
      if (isAuthPage && session?.user) {
        const redirectTo = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" 
          ? `/${locale}/admin/dashboard` 
          : `/${locale}/account`;
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }

      // Protect regular user pages
      if (isProtectedPage && !session?.user) {
        const redirectUrl = new URL(`/${locale}/signin`, request.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Protect admin pages
      if (isAdminPage) {
        if (!session?.user) {
          const redirectUrl = new URL(`/${locale}/signin`, request.url);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // Check if user has admin role
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
        }
      }
    } catch (error) {
      console.error("Middleware error:", error);
      if (isProtectedPage || isAdminPage) {
        const fallbackUrl = new URL(`/${locale}/signin`, request.url);
        return NextResponse.redirect(fallbackUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/",
    "/(ar|en)/:path*",
  ],
};