import { type NextRequest, NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If the refresh token is invalid/expired, clear all Supabase auth cookies
  // so the browser stops sending stale tokens on every request
  if (error?.code === 'refresh_token_not_found' || error?.code === 'session_not_found') {
    const allCookies = request.cookies.getAll()
    const supabaseCookies = allCookies.filter(
      (c) => c.name.startsWith('sb-') || c.name.startsWith('supabase-')
    )
    supabaseResponse = NextResponse.next({ request })
    for (const cookie of supabaseCookies) {
      request.cookies.delete(cookie.name)
      supabaseResponse.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
    }
    return { user: null, supabaseResponse, supabase }
  }

  return { user, supabaseResponse, supabase }
}
