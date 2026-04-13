'use server'

import { revalidatePath } from 'next/cache'

import { requireTeacherOrOwner } from '@/shared/lib/auth-guards'
import { createClient as createAdminClient } from '@supabase/supabase-js'

async function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function inviteStudent(email: string, fullName: string, password: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const admin = await getAdminClient()

  // Check if an auth user with this email already exists
  const { data: listData } = await admin.auth.admin.listUsers()
  const existingUser = listData?.users?.find((u) => u.email === email)

  let authUserId: string

  if (existingUser) {
    // User exists in auth - check if they already have a profile in this school
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', existingUser.id)
      .eq('school_id', schoolId)
      .single()

    if (existingProfile) {
      return { error: 'Student already exists in this school' }
    }

    authUserId = existingUser.id
  } else {
    // Create new auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError) {
      return { error: authError.message }
    }

    authUserId = authData.user.id
  }

  // Create profile in this school
  const { error: profileError } = await admin.from('profiles').insert({
    user_id: authUserId,
    school_id: schoolId,
    role: 'student',
    full_name: fullName,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/students')
  return { error: null }
}

export async function fetchStudentsPage(opts: {
  search?: string
  courseId?: string
  offset?: number
  limit?: number
}) {
  const { schoolId } = await requireTeacherOrOwner()
  const { getStudentsPaginated } = await import('./students.queries')
  return getStudentsPaginated(schoolId, opts)
}

export async function updateStudent(profileId: string, fullName: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const admin = await getAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', profileId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { error: null }
}

export async function deleteStudent(profileId: string) {
  const { schoolId } = await requireTeacherOrOwner()
  const admin = await getAdminClient()

  // Delete the profile (not the auth user, they may have profiles in other schools)
  const { error } = await admin
    .from('profiles')
    .delete()
    .eq('id', profileId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { error: null }
}
