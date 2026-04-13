import { getCourses } from '../api/courses.queries'
import { CourseList } from '../components/CourseList'

export async function CoursesContainer() {
  const courses = await getCourses()
  return <CourseList courses={courses} />
}
