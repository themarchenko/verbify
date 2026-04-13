import { redirect } from 'next/navigation'

import type { StaffPermission, UserRole } from '@/features/auth/types'
import { ReminderBell } from '@/features/schedule'
import { getUpcomingReminders } from '@/features/schedule/api/schedule.queries'
import { buildThemeVars } from '@/features/settings/model/color-schemes.config'
import { createClient } from '@/shared/api/supabase.server'

import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, school_id, permissions, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: school } = await supabase
    .from('schools')
    .select('name, logo_url, color_scheme, primary_color')
    .eq('id', profile.school_id!)
    .single()

  const isStaff = profile.role !== 'student'
  const reminders = isStaff ? await getUpcomingReminders().catch(() => []) : []
  const themeVars = buildThemeVars(school?.color_scheme ?? null, school?.primary_color ?? null)

  return (
    <div style={themeVars}>
      <DashboardShell
        schoolName={school?.name || 'Verbify'}
        schoolLogoUrl={school?.logo_url || null}
        userRole={profile.role as UserRole}
        userName={profile.full_name}
        userPermissions={(profile.permissions as StaffPermission[]) || []}
        userAvatarUrl={profile.avatar_url}
        headerSlot={isStaff ? <ReminderBell initialReminders={reminders} /> : undefined}
      >
        {children}
      </DashboardShell>
    </div>
  )
}
