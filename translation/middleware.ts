// import { NextRequest, NextResponse } from "next/server";
// import { match as matchLocale } from "@formatjs/intl-localematcher";
// import Negotiator from "negotiator";
// import { i18n, LanguageType } from "./i18.config";

// function getLocale(request: NextRequest): string | undefined {
//   const negotiatorHeaders: Record<string, string> = {};
//   request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
//   const locales: LanguageType[] = i18n.locales;
  
//   const languages = new Negotiator({
//     headers: negotiatorHeaders,
//   }).languages();
//   let locale = "";

//   try {
//     locale = matchLocale(languages, locales, i18n.defaultLocale);
//   } catch {
//     locale = i18n.defaultLocale;
//   }
//   return locale;
// }

// export async function middleware(request: NextRequest) {
//   const requestHeaders = new Headers(request.headers);
//   // when we call the x-url it gives back the url
//   requestHeaders.set("x-url", request.url);

//   const pathname = request.nextUrl.pathname;

//   const pathnameIsMissingLocale = i18n.locales.every(
//     (locale) => !pathname.startsWith(`/${locale}`)
//   );
//   // redirect if there is no locale
//   if (pathnameIsMissingLocale) {
//     const locale = getLocale(request);
//     return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
//   }
//   return NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });
// }

// export const config = {
//   // Matcher ignores ` /_next/`,`/api/`, ..etc
//   matcher: [
//     "/((?!api|_next/static|_next/image|favofon|robots.txt|sitemap.xml).*)",
//   ],
// };
