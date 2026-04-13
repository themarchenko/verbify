'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'
import { requireTeacherOrOwner } from '@/shared/lib/auth-guards'

export async function enrollStudents(
  courseId: string,
  studentIds: string[],
  expiresAt: string | null
) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const rows = studentIds.map((studentId) => ({
    student_id: studentId,
    course_id: courseId,
    school_id: schoolId,
    expires_at: expiresAt || null,
  }))

  const { error } = await supabase.from('enrollments').insert(rows)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/courses/${courseId}`)
  revalidatePath('/dashboard/students')
  return { error: null }
}

export async function enrollStudentInCourses(
  studentId: string,
  courseIds: string[],
  expiresAt: string | null
) {
  const { schoolId } = await requireTeacherOrOwner()
  const supabase = await createClient()

  const rows = courseIds.map((courseId) => ({
    student_id: studentId,
    course_id: courseId,
    school_id: schoolId,
    expires_at: expiresAt || null,
  }))

  const { error } = await supabase.from('enrollments').insert(rows)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/courses')
  revalidatePath(`/dashboard/students/${studentId}`)
  return { error: null }
}

export async function updateEnrollmentExpiration(enrollmentId: string, expiresAt: string | null) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase
    .from('enrollments')
    .update({ expires_at: expiresAt || null })
    .eq('id', enrollmentId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/students')
  return { error: null }
}

export async function removeEnrollment(enrollmentId: string) {
  await requireTeacherOrOwner()
  const supabase = await createClient()

  const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/students')
  return { error: null }
}
