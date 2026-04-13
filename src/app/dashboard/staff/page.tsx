import { getStaffMembers } from '@/features/staff/api/staff.queries'
import { StaffList } from '@/features/staff/components/StaffList'
import { createClient } from '@/shared/api/supabase.server'

export default async function StaffPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user!.id)
    .single()

  const staff = await getStaffMembers(profile!.school_id!)

  return <StaffList staff={staff} currentUserId={user!.id} />
}
