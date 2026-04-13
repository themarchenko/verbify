import { createClient } from '@/shared/api/supabase.server'

import type {
  ClassSessionWithRelations,
  LessonTeacher,
  UpcomingReminder,
} from '../model/schedule.types'

export async function getSessionsForWeek(
  weekStart: string,
  weekEnd: string
): Promise<ClassSessionWithRelations[]> {
  const supabase = await createClient()

  const { data: profile } = await supabase.auth.getUser()
  if (!profile.user) return []

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, role, school_id')
    .eq('user_id', profile.user.id)
    .single()

  if (!userProfile) return []

  let query = supabase
    .from('class_sessions')
    .select(
      `
      *,
      teacher:profiles!class_sessions_teacher_id_fkey(id, full_name, avatar_url),
      lesson:lessons(id, title, course_id),
      reminder:session_reminders(id, remind_minutes_before, remind_at, is_dismissed)
    `
    )
    .eq('school_id', userProfile.school_id!)
    .gte('scheduled_at', weekStart)
    .lt('scheduled_at', weekEnd)
    .order('scheduled_at', { ascending: true })

  // Teachers only see their own sessions
  if (userProfile.role === 'teacher') {
    query = query.eq('teacher_id', userProfile.id)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map((s) => ({
    ...s,
    reminder: Array.isArray(s.reminder) ? (s.reminder[0] ?? null) : s.reminder,
  })) as ClassSessionWithRelations[]
}

export async function getUpcomingReminders(): Promise<UpcomingReminder[]> {
  const supabase = await createClient()

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) return []

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', authUser.user.id)
    .single()

  if (!userProfile) return []

  const now = new Date().toISOString()
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('session_reminders')
    .select(
      `
      *,
      session:class_sessions(
        *,
        teacher:profiles!class_sessions_teacher_id_fkey(full_name)
      )
    `
    )
    .eq('profile_id', userProfile.id)
    .eq('is_dismissed', false)
    .gte('remind_at', now)
    .lte('remind_at', in24h)
    .order('remind_at', { ascending: true })

  if (error) return []

  return (data || []) as UpcomingReminder[]
}

export async function getLessonTeachers(lessonId: string): Promise<LessonTeacher[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lesson_teachers')
    .select(
      `
      *,
      teacher:profiles!lesson_teachers_teacher_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('lesson_id', lessonId)

  if (error) throw error

  return (data || []) as LessonTeacher[]
}

export async function getSchoolTeachers(): Promise<
  Array<{ id: string; full_name: string | null; avatar_url: string | null }>
> {
  const supabase = await createClient()

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) return []

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', authUser.user.id)
    .single()

  if (!userProfile) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('school_id', userProfile.school_id!)
    .in('role', ['teacher', 'owner'])
    .order('full_name', { ascending: true })

  if (error) return []

  return data || []
}

export async function getSchoolLessons(): Promise<
  Array<{ id: string; title: string; course_id: string | null; course_title: string | null }>
> {
  const supabase = await createClient()

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) return []

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', authUser.user.id)
    .single()

  if (!userProfile) return []

  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, course_id, courses(title)')
    .eq('school_id', userProfile.school_id!)
    .order('title', { ascending: true })

  if (error) return []

  return (data || []).map((l) => ({
    id: l.id,
    title: l.title,
    course_id: l.course_id,
    course_title: Array.isArray(l.courses)
      ? ((l.courses[0] as { title: string } | undefined)?.title ?? null)
      : ((l.courses as { title: string } | null)?.title ?? null),
  }))
}
