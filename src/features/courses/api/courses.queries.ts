import { createClient } from '@/shared/api/supabase.server'

export async function getCourses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(count), enrollments(count)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((course) => ({
    ...course,
    lesson_count: (course.lessons as unknown as { count: number }[])?.[0]?.count ?? 0,
    student_count: (course.enrollments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))
}

export async function getCourseById(courseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()

  if (error) throw error
  return data
}

export async function getCourseEnrollments(courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('enrollments')
    .select('id, student_id, enrolled_at, expires_at, profiles(id, full_name)')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })

  return (data || []).map((e) => {
    const profile = e.profiles as unknown as { id: string; full_name: string | null }
    return {
      id: e.id,
      studentId: e.student_id!,
      studentName: profile?.full_name || null,
      enrolledAt: e.enrolled_at,
      expiresAt: e.expires_at,
    }
  })
}

export async function getUnenrolledStudents(courseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) return []

  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', profile.school_id)
    .eq('role', 'student')
    .order('full_name')

  const { data: enrolledRows } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId)

  const enrolledIds = new Set((enrolledRows || []).map((e) => e.student_id))

  return (allStudents || []).filter((s) => !enrolledIds.has(s.id))
}

export async function getCourseLessons(courseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('*, homework_meta(due_date)')
    .eq('course_id', courseId)
    .order('order_index')

  if (error) throw error
  return (data || []).map((lesson) => {
    const meta = lesson.homework_meta as unknown as { due_date: string | null } | null
    return {
      ...lesson,
      due_date: meta?.due_date ?? null,
    }
  })
}
