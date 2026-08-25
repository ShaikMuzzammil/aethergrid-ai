import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

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
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/api/auth",
          "/api/auth/register",
        ];
        if (
          publicPaths.some(
            (p) => pathname === p || pathname.startsWith(p + "/")
          )
        )
          return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
