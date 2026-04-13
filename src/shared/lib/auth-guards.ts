'use server'

import { createClient } from '@/shared/api/supabase.server'

export async function requireTeacherOrOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id, role, permissions')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')
  if (profile.role === 'student') throw new Error('Students cannot manage data')

  return {
    userId: user.id,
    profileId: profile.id,
    schoolId: profile.school_id,
    role: profile.role,
    permissions: (profile.permissions || []) as string[],
  }
}

export async function requireStaff() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role, permissions')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')
  if (profile.role === 'student') throw new Error('Students cannot access staff area')

  return {
    userId: user.id,
    schoolId: profile.school_id,
    role: profile.role,
    permissions: (profile.permissions || []) as string[],
  }
}

export async function requireOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')
  if (profile.role !== 'owner') throw new Error('Only owners can manage school settings')

  return { userId: user.id, schoolId: profile.school_id }
}
