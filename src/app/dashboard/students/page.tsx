import { redirect } from 'next/navigation'

import { getStudentsPaginated } from '@/features/students/api/students.queries'
import { StudentList } from '@/features/students/components/StudentList'
import { createClient } from '@/shared/api/supabase.server'

export default async function StudentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) redirect('/login')

  const schoolId = profile.school_id

  const [initialPage, coursesResult] = await Promise.all([
    getStudentsPaginated(schoolId),
    supabase.from('courses').select('id, title').eq('school_id', schoolId).order('title'),
  ])

  return (
    <StudentList
      initialStudents={initialPage.students}
      initialTotal={initialPage.total}
      initialHasMore={initialPage.hasMore}
      courses={coursesResult.data || []}
    />
  )
}
