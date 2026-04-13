'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'
import { requireTeacherOrOwner } from '@/shared/lib/auth-guards'

export async function createSession(data: {
  title: string
  teacher_id: string
  lesson_id: string | null
  scheduled_at: string
  duration_minutes: number
  notes: string | null
}) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('class_sessions')
    .insert({ ...data, school_id: schoolId })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/schedule')
  return session
}

export async function createSessionsBulk(
  sessions: Array<{
    title: string
    teacher_id: string
    lesson_id: string | null
    scheduled_at: string
    duration_minutes: number
    notes: string | null
  }>
) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const rows = sessions.map((s) => ({ ...s, school_id: schoolId }))
  const { error } = await supabase.from('class_sessions').insert(rows)

  if (error) throw error

  revalidatePath('/dashboard/schedule')
}

export async function updateSession(
  sessionId: string,
  data: {
    title?: string
    teacher_id?: string
    lesson_id?: string | null
    scheduled_at?: string
    duration_minutes?: number
    notes?: string | null
  }
) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase.from('class_sessions').update(data).eq('id', sessionId)

  if (error) throw error

  revalidatePath('/dashboard/schedule')
}

export async function deleteSession(sessionId: string) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase.from('class_sessions').delete().eq('id', sessionId)

  if (error) throw error

  revalidatePath('/dashboard/schedule')
}

export async function countRelatedSessions(sessionId: string): Promise<number> {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('class_sessions')
    .select('title, teacher_id, duration_minutes, lesson_id')
    .eq('id', sessionId)
    .single()

  if (!session) return 0

  const { count, error } = await supabase
    .from('class_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('title', session.title)
    .eq('teacher_id', session.teacher_id)
    .eq('duration_minutes', session.duration_minutes)
    .neq('id', sessionId)

  if (error) return 0
  return count ?? 0
}

export async function deleteRelatedSessions(sessionId: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('class_sessions')
    .select('title, teacher_id, duration_minutes')
    .eq('id', sessionId)
    .single()

  if (!session) return

  // Delete all matching sessions (including the current one)
  const { error } = await supabase
    .from('class_sessions')
    .delete()
    .eq('school_id', schoolId)
    .eq('title', session.title)
    .eq('teacher_id', session.teacher_id)
    .eq('duration_minutes', session.duration_minutes)

  if (error) throw error

  revalidatePath('/dashboard/schedule')
}

export async function setReminder(
  sessionId: string,
  remindMinutesBefore: number,
  scheduledAt: string
) {
  const { schoolId, profileId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const remindAt = new Date(
    new Date(scheduledAt).getTime() - remindMinutesBefore * 60 * 1000
  ).toISOString()

  const { error } = await supabase.from('session_reminders').upsert(
    {
      session_id: sessionId,
      profile_id: profileId,
      school_id: schoolId,
      remind_minutes_before: remindMinutesBefore,
      remind_at: remindAt,
      is_dismissed: false,
    },
    { onConflict: 'session_id,profile_id' }
  )

  if (error) throw error
}

export async function removeReminder(sessionId: string) {
  const { profileId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  await supabase
    .from('session_reminders')
    .delete()
    .eq('session_id', sessionId)
    .eq('profile_id', profileId)
}

export async function dismissReminder(reminderId: string) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  await supabase.from('session_reminders').update({ is_dismissed: true }).eq('id', reminderId)
}

export async function assignTeacherToLesson(lessonId: string, teacherId: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase
    .from('lesson_teachers')
    .upsert(
      { lesson_id: lessonId, teacher_id: teacherId, school_id: schoolId },
      { onConflict: 'lesson_id,teacher_id' }
    )

  if (error) throw error
}

export async function removeTeacherFromLesson(lessonId: string, teacherId: string) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase
    .from('lesson_teachers')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('teacher_id', teacherId)

  if (error) throw error
}
