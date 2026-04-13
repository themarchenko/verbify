'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'
import { requireTeacherOrOwner } from '@/shared/lib/auth-guards'

export async function createHomework(courseId: string, title: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  // Get next order index
  const { data: existing } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      school_id: schoolId,
      title,
      order_index: nextIndex,
      lesson_type: 'homework',
    })
    .select()
    .single()

  if (error) throw error

  // Create homework_meta row
  await supabase.from('homework_meta').insert({
    lesson_id: lesson.id,
    school_id: schoolId,
  })

  revalidatePath(`/dashboard/courses/${courseId}`)
  return lesson
}

export async function updateHomeworkMeta(
  lessonId: string,
  updates: { due_date?: string | null; allow_late_submission?: boolean }
) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase.from('homework_meta').update(updates).eq('lesson_id', lessonId)

  if (error) throw error
}

export async function assignStudents(lessonId: string, studentIds: string[]) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  // Delete existing assignments
  await supabase.from('homework_assignments').delete().eq('lesson_id', lessonId)

  // Insert new assignments (empty = all enrolled)
  if (studentIds.length > 0) {
    const { error } = await supabase.from('homework_assignments').insert(
      studentIds.map((studentId) => ({
        lesson_id: lessonId,
        student_id: studentId,
        school_id: schoolId,
      }))
    )
    if (error) throw error
  }
}

export async function submitHomework(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.school_id) throw new Error('No profile')

  const { error } = await supabase.from('homework_submissions').upsert(
    {
      lesson_id: lessonId,
      student_id: profile.id,
      school_id: profile.school_id,
      status: 'submitted' as const,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'lesson_id,student_id' }
  )

  if (error) throw error
}

export async function updateSubmissionStatus(lessonId: string, status: 'in_progress') {
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

  if (!profile || !profile.school_id) return

  // Only update if not already submitted/graded
  const { data: existing } = await supabase
    .from('homework_submissions')
    .select('status')
    .eq('lesson_id', lessonId)
    .eq('student_id', profile.id)
    .single()

  if (existing && (existing.status === 'submitted' || existing.status === 'graded')) return
  if (!profile.school_id) return

  await supabase.from('homework_submissions').upsert(
    {
      lesson_id: lessonId,
      student_id: profile.id,
      school_id: profile.school_id,
      status,
    },
    { onConflict: 'lesson_id,student_id' }
  )
}

export async function gradeSubmission(
  lessonId: string,
  studentId: string,
  data: { score: number; feedback: string }
) {
  const staff = await requireTeacherOrOwner()
  const supabase = await createClient()

  // Get grader profile id
  const { data: graderProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', staff.userId)
    .eq('school_id', staff.schoolId)
    .single()

  if (!graderProfile) throw new Error('No profile')

  const { error } = await supabase
    .from('homework_submissions')
    .update({
      status: 'graded',
      score: data.score,
      feedback: data.feedback,
      graded_at: new Date().toISOString(),
      graded_by: graderProfile.id,
    })
    .eq('lesson_id', lessonId)
    .eq('student_id', studentId)

  if (error) throw error
  revalidatePath(`/dashboard/courses`)
}

export async function saveBlockFeedback(blockId: string, studentId: string, feedback: string) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  // Update the response JSONB to include teacher_feedback
  const { data: progress } = await supabase
    .from('student_progress')
    .select('response')
    .eq('block_id', blockId)
    .eq('student_id', studentId)
    .single()

  const response = (progress?.response as Record<string, unknown>) || {}

  await supabase
    .from('student_progress')
    .update({ response: { ...response, teacher_feedback: feedback } })
    .eq('block_id', blockId)
    .eq('student_id', studentId)
}

export async function saveOpenAnswerProgress(blockId: string, lessonId: string, text: string) {
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

  if (!profile || !profile.school_id) return

  const { data: existing } = await supabase
    .from('student_progress')
    .select('attempts, response')
    .eq('student_id', profile.id)
    .eq('block_id', blockId)
    .single()

  const attempts = (existing?.attempts || 0) + 1
  const prevResponse = (existing?.response as Record<string, unknown>) || {}

  await supabase.from('student_progress').upsert(
    {
      student_id: profile.id,
      block_id: blockId,
      lesson_id: lessonId,
      school_id: profile.school_id,
      completed: text.trim().length > 0,
      attempts,
      response: { ...prevResponse, text },
      completed_at: text.trim().length > 0 ? new Date().toISOString() : null,
    },
    { onConflict: 'student_id,block_id' }
  )
}

export async function saveFileUploadProgress(
  blockId: string,
  lessonId: string,
  files: Array<{ name: string; url: string; size: number }>
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

  if (!profile || !profile.school_id) return

  const { data: existing } = await supabase
    .from('student_progress')
    .select('attempts, response')
    .eq('student_id', profile.id)
    .eq('block_id', blockId)
    .single()

  const attempts = (existing?.attempts || 0) + 1
  const prevResponse = (existing?.response as Record<string, unknown>) || {}

  await supabase.from('student_progress').upsert(
    {
      student_id: profile.id,
      block_id: blockId,
      lesson_id: lessonId,
      school_id: profile.school_id,
      completed: files.length > 0,
      attempts,
      response: { ...prevResponse, files },
      completed_at: files.length > 0 ? new Date().toISOString() : null,
    },
    { onConflict: 'student_id,block_id' }
  )
}
