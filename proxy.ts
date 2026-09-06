import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin-auth";

// Proxy (formerly middleware in pre-v16 Next.js) runs before the request
// reaches your app. Here it gates every admin route behind a valid session.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // AutoField has its own Supabase role check in its nested layout. It must
  // not be blocked by MotionGrid's separate local-admin session.
  if (pathname.startsWith("/adminj2-v1/autofield")) {
    return NextResponse.next();
  }

  // The MotionGrid login page must stay reachable while logged out. A valid
  // remembered session skips it and goes directly to the requested admin page.
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const user = verifySession(session);
  if (pathname === "/adminj2-v1/login" || pathname === "/adminj2-v1/login/") {
    if (user) {
      const dashboardUrl = new URL("/adminj2-v1/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL("/adminj2-v1/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run the auth gate on the adminj2-v1 section. Static assets and the
  // public site never touch the proxy.
  matcher: ["/adminj2-v1/:path*"],
};
