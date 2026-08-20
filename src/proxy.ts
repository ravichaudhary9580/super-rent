import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (token) {
      // If already logged in as admin and visiting /admin/login, redirect to /admin
      if (path === "/admin/login") {
        return NextResponse.redirect(new URL(token.role === "admin" ? "/admin" : `/${token.role || "tenant"}`, req.url));
      }

      // If user requires onboarding, redirect them to /onboarding
      if (token.requiresOnboarding && path !== "/onboarding" && path !== "/admin/login" && !path.startsWith("/api")) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      // Strict role check: non-admin users cannot access /admin pages
      if (path.startsWith("/admin") && path !== "/admin/login" && token.role !== "admin") {
        return NextResponse.redirect(new URL(`/${token.role || "tenant"}`, req.url));
      }

      // If user is fully onboarded but tries to go to /onboarding, redirect them to their dashboard
      if (!token.requiresOnboarding && path === "/onboarding") {
        return NextResponse.redirect(new URL(`/${token.role || "tenant"}`, req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to always run the proxy function above, even if there's no token
      authorized: ({ token, req }) => true, 
    },
  }
);

export const config = {
  // Apply proxy to dashboards and onboarding page
  matcher: ["/tenant/:path*", "/owner/:path*", "/admin/:path*", "/onboarding"],
};
