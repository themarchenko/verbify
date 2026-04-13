import { createClient } from '@/shared/api/supabase.server'

export async function getHomeworkMeta(lessonId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('homework_meta')
    .select('*')
    .eq('lesson_id', lessonId)
    .single()

  return data
}

export async function getHomeworkAssignments(lessonId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('homework_assignments')
    .select('student_id, assigned_at, profiles(id, full_name, avatar_url)')
    .eq('lesson_id', lessonId)

  return (data || []).map((a) => ({
    student_id: a.student_id,
    assigned_at: a.assigned_at,
    profile: a.profiles as unknown as {
      id: string
      full_name: string | null
      avatar_url: string | null
    },
  }))
}

export async function getHomeworkSubmissions(lessonId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('homework_submissions')
    .select('*, profiles!homework_submissions_student_id_fkey(id, full_name, avatar_url)')
    .eq('lesson_id', lessonId)
    .order('submitted_at', { ascending: false, nullsFirst: false })

  return (data || []).map((s) => ({
    ...s,
    student: s.profiles as unknown as {
      id: string
      full_name: string | null
      avatar_url: string | null
    },
  }))
}

export async function getStudentSubmission(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  const { data } = await supabase
    .from('homework_submissions')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('student_id', profile.id)
    .single()

  return data
}

export async function getHomeworkForGrading(lessonId: string, studentId: string) {
  const supabase = await createClient()

  // Get lesson blocks
  const { data: blocks } = await supabase
    .from('lesson_blocks')
    .select('id, type, content, order_index')
    .eq('lesson_id', lessonId)
    .order('order_index')

  // Get student progress for all blocks
  const { data: progress } = await supabase
    .from('student_progress')
    .select('block_id, completed, score, attempts, response')
    .eq('lesson_id', lessonId)
    .eq('student_id', studentId)

  const progressMap = new Map((progress || []).map((p) => [p.block_id, p]))

  // Get submission
  const { data: submission } = await supabase
    .from('homework_submissions')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('student_id', studentId)
    .single()

  // Get student profile
  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', studentId)
    .single()

  return {
    blocks: (blocks || []).map((block) => ({
      ...block,
      progress: progressMap.get(block.id) || null,
    })),
    submission,
    student,
  }
}

export async function getPendingSubmissionsCount() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('homework_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted')

  return count || 0
}

export async function isHomeworkAssignedToStudent(lessonId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return false

  // Check if there are any specific assignments
  const { count: assignmentCount } = await supabase
    .from('homework_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', lessonId)

  // No specific assignments = all enrolled students see it
  if (!assignmentCount || assignmentCount === 0) return true

  // Check if this student is specifically assigned
  const { count } = await supabase
    .from('homework_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', lessonId)
    .eq('student_id', profile.id)

  return (count || 0) > 0
}
