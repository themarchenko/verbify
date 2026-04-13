import { getHomeworkMeta, getHomeworkSubmissions } from '@/features/homework/api/homework.queries'
import { HomeworkGradingList } from '@/features/homework/components/HomeworkGradingList'
import { getLessonWithBlocks } from '@/features/lesson-builder/api/builder.queries'

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function SubmissionsPage({ params }: Props) {
  const { courseId, lessonId } = await params

  const { lesson } = await getLessonWithBlocks(lessonId)
  const submissions = await getHomeworkSubmissions(lessonId)
  const meta = await getHomeworkMeta(lessonId)

  return (
    <HomeworkGradingList
      lessonId={lessonId}
      courseId={courseId}
      lessonTitle={lesson.title}
      submissions={submissions}
      meta={
        meta
          ? {
              id: meta.id,
              lesson_id: meta.lesson_id,
              school_id: meta.school_id,
              due_date: meta.due_date,
              allow_late_submission: meta.allow_late_submission ?? false,
            }
          : null
      }
    />
  )
}
