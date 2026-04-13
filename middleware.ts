import { type NextRequest, NextResponse } from 'next/server'

import { updateSession } from '@/shared/api/supabase.middleware'

const PUBLIC_PATHS = ['/login', '/register', '/terms', '/privacy']

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const path = request.nextUrl.pathname

  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isPublicPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'student' ? '/learn' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role

    // Students can only access /learn routes
    if (role === 'student' && path.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/learn'
      return NextResponse.redirect(url)
    }

    // Staff (owner/teacher/manager) cannot access /learn routes
    if (
      (role === 'owner' || role === 'teacher' || role === 'manager') &&
      path.startsWith('/learn')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
