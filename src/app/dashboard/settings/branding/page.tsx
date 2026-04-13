import { redirect } from 'next/navigation'

import { BrandingSettingsContent } from '@/features/settings'
import { getSchoolSettings } from '@/features/settings/api/settings.queries'
import { createClient } from '@/shared/api/supabase.server'

export default async function BrandingSettingsPage() {
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

  return (
    <BrandingSettingsContent
      colorScheme={school.color_scheme}
      primaryColor={school.primary_color}
      loginHeading={school.login_heading}
      loginSubheading={school.login_subheading}
    />
  )
}
