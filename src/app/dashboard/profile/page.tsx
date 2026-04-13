import { redirect } from 'next/navigation'

import { ProfileInfoForm } from '@/features/auth/components/ProfileInfoForm'
import { createClient } from '@/shared/api/supabase.server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  return (
    <ProfileInfoForm
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      avatarUrl={profile?.avatar_url ?? null}
    />
  )
}
