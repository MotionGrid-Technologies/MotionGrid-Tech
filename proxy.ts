import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRoleFromJWT } from '@/lib/role'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Public login page: if already authenticated, skip it and go to /dashboard.
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protected dashboard routes.
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = getRoleFromJWT(session)

    // /dashboard root — role-based landing.
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const target =
        role === 'super_admin'
          ? '/dashboard/admin/autofield'
          : '/dashboard/admin/dashboard'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // /dashboard/admin/autofield/* — super_admin only.
    if (pathname.startsWith('/dashboard/admin/autofield')) {
      if (role !== 'super_admin') {
        return NextResponse.redirect(
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
