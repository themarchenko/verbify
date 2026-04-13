'use server'

import { getCourseEnrollments, getUnenrolledStudents } from './courses.queries'

export async function fetchCourseStudentsData(courseId: string) {
  const [enrollments, unenrolledStudents] = await Promise.all([
    getCourseEnrollments(courseId),
    getUnenrolledStudents(courseId),
  ])

  return { enrollments, unenrolledStudents }
}
