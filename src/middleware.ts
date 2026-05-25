// import createMiddleware from "next-intl/middleware";
// import { NextRequest, NextResponse } from "next/server";
// import { routing } from "./i18n/routing";

// const intlMiddleware = createMiddleware(routing);

// const PUBLIC_ROUTES = [
//   "/login",
//   "/signup",
//   "/forgot-password",
//   "/reset-password",
//   "/verify-otp",
// ];

// export default function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Strip locale prefix to check the route
//   const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "");

//   const isPublicRoute = PUBLIC_ROUTES.some((route) =>
//     pathnameWithoutLocale.startsWith(route)
//   );

//   const token = request.cookies.get("nabda-official-token")?.value;

//   // Not logged in + trying to access protected route → redirect to login
//   if (!token && !isPublicRoute && pathnameWithoutLocale !== "/") {
//     const locale = pathname.split("/")[1] || "en";
//     return NextResponse.redirect(
//       new URL(`/${locale}/login`, request.url)
//     );
//   }

//   // Logged in + trying to access auth pages → redirect to projects
//   if (token && isPublicRoute) {
//     const locale = pathname.split("/")[1] || "en";
//     return NextResponse.redirect(
//       new URL(`/${locale}/projects`, request.url)
//     );
//   }

//   // Pass through to i18n middleware
//   return intlMiddleware(request);
// }

// export const config = {
//   matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
// };

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Routes that don't require authentication AND redirect signed-in users
 * away (e.g. you can't visit /login when already logged in).
 */
const AUTH_PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

/**
 * Routes that should be accessible to both signed-in AND signed-out users
 * without redirecting either way (e.g. invitation acceptance).
 */
const OPEN_ROUTES = [
  "/invitations/accept",
  "/connect-whatsapp-account",
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check the route
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "");

  const isAuthPublicRoute = AUTH_PUBLIC_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  const isOpenRoute = OPEN_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  const token = request.cookies.get("nabda-official-token")?.value;

  // Open routes: pass through regardless of auth state
  if (isOpenRoute) {
    return intlMiddleware(request);
  }

  // Not logged in + trying to access protected route → redirect to login
  if (!token && !isAuthPublicRoute && pathnameWithoutLocale !== "/") {
    const locale = pathname.split("/")[1] || "en";
    return NextResponse.redirect(
      new URL(`/${locale}/login`, request.url)
    );
  }

  // Logged in + trying to access auth pages → redirect to projects
  if (token && isAuthPublicRoute) {
    const locale = pathname.split("/")[1] || "en";
    return NextResponse.redirect(
      new URL(`/${locale}/projects`, request.url)
    );
  }

  // Pass through to i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
