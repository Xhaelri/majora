
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth'; // Adjust path to your auth config

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Define auth pages that should redirect authenticated users away
  const authPages = ['/signin', '/signup', '/login', '/register'];
  
  // Define protected pages that require authentication
  const protectedPages = ['/account', '/dashboard', '/profile', '/settings'];
  
  // Check if the current path is an auth page or protected page
  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  
  if (isAuthPage || isProtectedPage) {
    try {
      // Get the session
      const session = await auth();
      
      if (isAuthPage && session?.user) {
        // If user is authenticated and trying to access auth pages, redirect to account
        console.log(`Authenticated user accessing ${pathname}, redirecting to /account`);
        return NextResponse.redirect(new URL('/account', request.url));
      }
      
      if (isProtectedPage && !session?.user) {
        // If user is not authenticated and trying to access protected pages, redirect to signin
        console.log(`Unauthenticated user accessing ${pathname}, redirecting to /signin`);
        const signinUrl = new URL('/signin', request.url);
        // Add the original URL as a callback parameter
        signinUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signinUrl);
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      // If there's an error getting the session:
      // - For auth pages: allow access (so users can still sign in)
      // - For protected pages: redirect to signin for safety
      if (isProtectedPage) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  // Match both auth pages and protected pages
  matcher: [
    '/signin/:path*',
    '/signup/:path*',
    '/login/:path*',
    '/register/:path*',
    '/account/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*'
  ]
};