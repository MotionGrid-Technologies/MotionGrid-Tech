import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRoleFromJWT } from '@/lib/role'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  function redirectWithAuthState(url: URL) {
    const redirectResponse = NextResponse.redirect(url)
    response.headers.forEach((value, key) => {
      const normalizedKey = key.toLowerCase()
      if (normalizedKey !== 'set-cookie' && !normalizedKey.startsWith('x-middleware-')) {
        redirectResponse.headers.set(key, value)
      }
    })
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SITE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value)
          )
        },
      },
    }
  )

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsError ? null : claimsData?.claims

  const pathname = request.nextUrl.pathname

  // Public login page: if already authenticated, skip it and go to /dashboard.
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (claims) {
      return redirectWithAuthState(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protected dashboard routes.
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!claims) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return redirectWithAuthState(loginUrl)
    }

    const role = getRoleFromJWT(claims)

    // /dashboard root — role-based landing.
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const target =
        role === 'super_admin'
          ? '/dashboard/admin/dashboard'
          : '/dashboard/admin/dashboard'
      return redirectWithAuthState(new URL(target, request.url))
    }

    // /dashboard/admin/* — admin or super_admin only.
    if (pathname.startsWith('/dashboard/admin')) {
      if (role !== 'admin' && role !== 'super_admin') {
        return redirectWithAuthState(
          new URL('/dashboard/admin/dashboard', request.url)
        )
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/login/:path*', '/dashboard/:path*'],
}
