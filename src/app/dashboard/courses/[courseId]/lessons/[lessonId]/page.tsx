import { getCourseEnrollments } from '@/features/courses/api/courses.queries'
import { getHomeworkAssignments, getHomeworkMeta } from '@/features/homework/api/homework.queries'
import { LessonBuilderClient } from '@/features/lesson-builder'
import { getLessonWithBlocks } from '@/features/lesson-builder/api/builder.queries'
import { getLessonTeachers, getSchoolTeachers } from '@/features/schedule/api/schedule.queries'

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function LessonBuilderPage({ params }: Props) {
  const { lessonId, courseId } = await params
  const { lesson, blocks, courseTitle } = await getLessonWithBlocks(lessonId)

  let homeworkMeta = null
  let homeworkAssignments: Array<{
    student_id: string
    profile: { id: string; full_name: string | null; avatar_url: string | null }
  }> = []
  let enrolledStudents: Array<{ studentId: string; studentName: string | null }> = []
  if (lesson.lesson_type === 'homework') {
    homeworkMeta = await getHomeworkMeta(lessonId)
    homeworkAssignments = await getHomeworkAssignments(lessonId)
    enrolledStudents = await getCourseEnrollments(courseId)
  }

  const [lessonTeachers, allTeachers] = await Promise.all([
    getLessonTeachers(lessonId),
    getSchoolTeachers(),
  ])

  return (
    <div className="-m-6 h-[calc(100vh-3.5rem)]">
      <LessonBuilderClient
        lesson={lesson}
        initialBlocks={blocks as never[]}
        courseTitle={courseTitle}
        homeworkMeta={homeworkMeta}
        homeworkAssignments={homeworkAssignments}
        enrolledStudents={enrolledStudents}
        courseId={courseId}
        lessonTeachers={lessonTeachers}
        allTeachers={allTeachers}
      />
    </div>
  )
}
