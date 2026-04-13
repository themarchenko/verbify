import { notFound } from 'next/navigation'

import {
  getAvailableCoursesForStudent,
  getStudentDetail,
} from '@/features/students/api/students.queries'
import { StudentDetail } from '@/features/students/components/StudentDetail'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, availableCourses] = await Promise.all([
    getStudentDetail(id),
    getAvailableCoursesForStudent(id),
  ])

  if (!data) notFound()

  return (
    <StudentDetail
      student={data.student}
      stats={data.stats}
      courses={data.courses}
      availableCourses={availableCourses}
    />
  )
}
