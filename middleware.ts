import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth"; // Adjust path to your auth config
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api")) {
    return NextResponse.next(); // Bypass middleware for /api/* routes
  }
  // Define auth pages that should redirect authenticated users away
  const authPages = ["/signin", "/signup", "/login", "/register"];

  // Define protected pages that require authentication
  const protectedPages = ["/account", "/dashboard", "/profile", "/settings"];

  // Check if the current path is an auth page or protected page
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));
  const isProtectedPage = protectedPages.some((page) =>
    pathname.startsWith(page)
  );

  if (isAuthPage || isProtectedPage) {
    try {
      // Get the session
      const session = await auth();

      if (isAuthPage && session?.user) {
        // If user is authenticated and trying to access auth pages, redirect to account
        console.log(
          `Authenticated user accessing ${pathname}, redirecting to /account`
        );
        return NextResponse.redirect(new URL("/account", request.url));
      }

      if (isProtectedPage && !session?.user) {
        // If user is not authenticated and trying to access protected pages, redirect to signin
        console.log(
          `Unauthenticated user accessing ${pathname}, redirecting to /signin`
        );
        const signinUrl = new URL("/signin", request.url);
        // Add the original URL as a callback parameter
        signinUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signinUrl);
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      // If there's an error getting the session:
      // - For auth pages: allow access (so users can still sign in)
      // - For protected pages: redirect to signin for safety
      if (isProtectedPage) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }
    }
  }

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
  ],
};
