import { NextResponse } from 'next/server'

import { createClient } from '@/shared/api/supabase.server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      const redirectPath = profile?.role === 'student' ? '/learn' : '/dashboard'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
