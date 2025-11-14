export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - / (homepage - marketing page)
     * - api/auth (authentication endpoints)
     * - auth/sign-in (login page)
     * - auth/sign-up (registration page)
     * - auth/forgot-password (password reset page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/* (public assets)
     */
    "/((?!$|api/auth|auth/sign-in|auth/sign-up|auth/forgot-password|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
