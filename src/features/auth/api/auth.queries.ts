import { headers } from 'next/headers'

import { createClient as createAdminClient } from '@supabase/supabase-js'

import { createClient } from '@/shared/api/supabase.server'

import type { Profile } from '../types'

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, user_id, school_id, role, full_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  return data as Profile | null
}

export async function getSchoolLoginBranding() {
  // Use service role to bypass RLS — no user session on login page
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? ''
  const hostname = host.split(':')[0]

  // Resolve school by custom_domain, fall back to first school
  const { data: schoolByDomain } = await supabase
    .from('schools')
    .select('name, logo_url, login_heading, login_subheading')
    .eq('custom_domain', hostname)
    .single()

  const data = schoolByDomain ?? (
    await supabase
      .from('schools')
      .select('name, logo_url, login_heading, login_subheading')
      .limit(1)
      .single()
  ).data

  return {
    name: data?.name ?? 'Verbify',
    logoUrl: data?.logo_url ?? null,
    loginHeading: data?.login_heading ?? data?.name ?? 'Verbify',
    loginSubheading: data?.login_subheading ?? null,
  }
}
