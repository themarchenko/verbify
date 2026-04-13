import { createClient } from '@/shared/api/supabase.server'

export type StaffRow = {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  permissions: string[]
  created_at: string | null
}

export async function getStaffMembers(schoolId: string): Promise<StaffRow[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, role, permissions, created_at')
    .eq('school_id', schoolId)
    .in('role', ['owner', 'teacher', 'manager'])
    .order('created_at', { ascending: true })

  return (data || []) as StaffRow[]
}
