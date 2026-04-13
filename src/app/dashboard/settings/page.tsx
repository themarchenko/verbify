import { redirect } from 'next/navigation'

import { GeneralSettingsContent } from '@/features/settings'
import { getSchoolSettings } from '@/features/settings/api/settings.queries'
import { createClient } from '@/shared/api/supabase.server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id || profile.role !== 'owner') redirect('/dashboard')

  const school = await getSchoolSettings(profile.school_id)

  return <GeneralSettingsContent name={school.name} slug={school.slug} logoUrl={school.logo_url} />
}
