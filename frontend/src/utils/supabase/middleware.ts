import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false
  const isDocumentNavigation =
    (request.method === 'GET' || request.method === 'HEAD') && acceptsHtml

  // Admin routing protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.email !== 'raflian100@gmail.com') {
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  // App routing protection
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!user) {
      if (isDocumentNavigation) {
        return NextResponse.rewrite(new URL('/login', request.url))
      }

      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Logged-in users should skip the login screen, but keep the public home
  // page reachable to avoid redirect loops during account switching flows.
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return supabaseResponse
}
