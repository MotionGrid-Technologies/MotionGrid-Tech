import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin-auth";

// Proxy (formerly middleware in pre-v16 Next.js) runs before the request
// reaches your app. Here it gates every admin route behind a valid session.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page must stay reachable while logged out.
  if (pathname === "/adminj2-v1/login" || pathname === "/adminj2-v1/login/") {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySession(session)) {
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