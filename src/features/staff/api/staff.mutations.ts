'use server'

import { revalidatePath } from 'next/cache'

import type { StaffPermission, UserRole } from '@/features/auth/types'
import { requireOwner } from '@/shared/lib/auth-guards'
import { createClient as createAdminClient } from '@supabase/supabase-js'

async function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function inviteStaff(
  email: string,
  fullName: string,
  password: string,
  role: 'teacher' | 'manager',
  permissions: StaffPermission[]
) {
  const { schoolId } = await requireOwner()
  const admin = await getAdminClient()

  const { data: listData } = await admin.auth.admin.listUsers()
  const existingUser = listData?.users?.find((u) => u.email === email)

  let authUserId: string

  if (existingUser) {
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', existingUser.id)
      .eq('school_id', schoolId)
      .single()

    if (existingProfile) {
      return { error: 'already_exists' }
    }

    authUserId = existingUser.id
  } else {
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

  const { error: profileError } = await admin.from('profiles').insert({
    user_id: authUserId,
    school_id: schoolId,
    role,
    full_name: fullName,
    permissions,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/staff')
  return { error: null }
}

export async function updateStaffMember(
  profileId: string,
  data: {
    fullName?: string
    role?: 'teacher' | 'manager'
    permissions?: StaffPermission[]
  }
) {
  const { schoolId } = await requireOwner()
  const admin = await getAdminClient()

  // Prevent editing owner profiles
  const { data: target } = await admin
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .eq('school_id', schoolId)
    .single()

  if (!target) return { error: 'not_found' }
  if (target.role === 'owner') return { error: 'cannot_edit_owner' }

  const update: Record<string, unknown> = {}
  if (data.fullName !== undefined) update.full_name = data.fullName
  if (data.role !== undefined) update.role = data.role
  if (data.permissions !== undefined) update.permissions = data.permissions

  const { error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', profileId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/staff')
  return { error: null }
}

export async function removeStaffMember(profileId: string) {
  const { schoolId } = await requireOwner()
  const admin = await getAdminClient()

  // Prevent deleting owner profiles
  const { data: target } = await admin
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .eq('school_id', schoolId)
    .single()

  if (!target) return { error: 'not_found' }
  if (target.role === 'owner') return { error: 'cannot_remove_owner' }

  const { error } = await admin
    .from('profiles')
    .delete()
    .eq('id', profileId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/staff')
  return { error: null }
}
