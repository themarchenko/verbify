import { redirect } from 'next/navigation'

import { SchedulePageContainer } from '@/features/schedule'
import {
  getSchoolLessons,
  getSchoolTeachers,
  getSessionsForWeek,
} from '@/features/schedule/api/schedule.queries'
import { createClient } from '@/shared/api/supabase.server'

export default async function SchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'student') redirect('/dashboard')

  // Default to current week
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)

  const [sessions, teachers, lessons] = await Promise.all([
    getSessionsForWeek(monday.toISOString(), sunday.toISOString()),
    getSchoolTeachers(),
    getSchoolLessons(),
  ])

  return (
    <div className="-m-6 lg:-m-8 h-[calc(100vh-4rem)] p-6 lg:p-8 flex flex-col">
      <SchedulePageContainer
        sessions={sessions}
        teachers={teachers}
        lessons={lessons}
        currentProfileId={profile.id}
        userRole={profile.role}
      />
    </div>
  )
}
