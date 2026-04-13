import { getCourseById, getCourseLessons } from '@/features/courses/api/courses.queries'
import { CourseDetail } from '@/features/courses/components/CourseDetail'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params
  const [course, lessons] = await Promise.all([getCourseById(courseId), getCourseLessons(courseId)])

  return <CourseDetail course={course} lessons={lessons} />
}
