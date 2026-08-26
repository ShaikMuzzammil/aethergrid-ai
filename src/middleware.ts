import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirect non-admins away from /admin routes
    if (
      pathname.startsWith("/admin") &&
      token?.role !== "ADMIN" &&
      token?.role !== "SUPERADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public paths — no auth required
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/docs",
          "/api/auth",
        ];

        const isPublic = publicPaths.some(
          (p) => pathname === p || pathname.startsWith(p + "/")
        );

        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
