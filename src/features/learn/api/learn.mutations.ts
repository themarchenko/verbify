'use server'

import { createClient } from '@/shared/api/supabase.server'

export async function saveProgress(
  blockId: string,
  lessonId: string,
  completed: boolean,
  score?: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) return

  // Check existing progress to increment attempts
  const { data: existing } = await supabase
    .from('student_progress')
    .select('attempts')
    .eq('student_id', profile.id)
    .eq('block_id', blockId)
    .single()

  const attempts = (existing?.attempts || 0) + 1

  await supabase.from('student_progress').upsert(
    {
      student_id: profile.id,
      block_id: blockId,
      lesson_id: lessonId,
      school_id: profile.school_id,
      completed,
      score: score ?? null,
      attempts,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'student_id,block_id' }
  )
}

export async function completeLesson(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) return

  await supabase.from('lesson_completions').upsert(
    {
      student_id: profile.id,
      lesson_id: lessonId,
      school_id: profile.school_id,
    },
    { onConflict: 'student_id,lesson_id' }
  )
}
