import { getHomeworkForGrading } from '@/features/homework/api/homework.queries'
import { HomeworkGradingView } from '@/features/homework/components/HomeworkGradingView'
import { getLessonWithBlocks } from '@/features/lesson-builder/api/builder.queries'

interface Props {
  params: Promise<{ courseId: string; lessonId: string; studentId: string }>
}

export default async function GradeStudentPage({ params }: Props) {
  const { courseId, lessonId, studentId } = await params

  const { lesson } = await getLessonWithBlocks(lessonId)
  const data = await getHomeworkForGrading(lessonId, studentId)

  return (
    <HomeworkGradingView
      lessonId={lessonId}
      courseId={courseId}
      lessonTitle={lesson.title}
      student={data.student}
      blocks={data.blocks.map((b) => ({
        ...b,
        content: (b.content || {}) as Record<string, unknown>,
        progress: b.progress
          ? {
              ...b.progress,
              response: (b.progress.response as Record<string, unknown>) || null,
            }
          : null,
      }))}
      submission={data.submission}
    />
  )
}
