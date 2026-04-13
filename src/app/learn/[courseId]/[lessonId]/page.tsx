import { redirect } from 'next/navigation'

import { getHomeworkMeta, getStudentSubmission } from '@/features/homework/api/homework.queries'
import { computeHomeworkStatus } from '@/features/homework/hooks/useHomeworkStatus'
import { AccessExpired } from '@/features/learn'
import { LessonPlayer } from '@/features/learn'
import {
  checkCourseAccess,
  getLessonForStudent,
  getNextLesson,
  isLessonAccessible,
} from '@/features/learn/api/learn.queries'

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function StudentLessonPage({ params }: Props) {
  const { courseId, lessonId } = await params

  const access = await checkCourseAccess(courseId)
  if (access.status === 'denied') redirect('/learn')
  if (access.status === 'expired') {
    return (
      <div className="max-w-3xl mx-auto">
        <AccessExpired />
      </div>
    )
  }

  const accessible = await isLessonAccessible(lessonId, courseId)
  if (!accessible) redirect(`/learn/${courseId}`)

  const lesson = await getLessonForStudent(lessonId)

  if (!lesson) redirect('/learn')

  const lessonWithTypedBlocks = {
    ...lesson,
    blocks: lesson.blocks.map((b) => ({
      ...b,
      content: (b.content || {}) as Record<string, unknown>,
    })),
  }

  const nextLesson = lesson.course_id
    ? await getNextLesson(lesson.course_id, lesson.order_index)
    : null

  // Homework data
  let homeworkMeta = null
  let submissionStatus = null
  let submissionFeedback = null
  let submissionScore = null

  if (lessonWithTypedBlocks.lesson_type === 'homework') {
    const meta = await getHomeworkMeta(lessonId)
    const submission = await getStudentSubmission(lessonId)

    if (meta) {
      homeworkMeta = {
        id: meta.id,
        lesson_id: meta.lesson_id,
        school_id: meta.school_id,
        due_date: meta.due_date,
        allow_late_submission: meta.allow_late_submission ?? false,
      }
      submissionStatus = computeHomeworkStatus(
        submission
          ? {
              ...submission,
              status: submission.status as 'not_started' | 'in_progress' | 'submitted' | 'graded',
            }
          : null,
        homeworkMeta
      )
    }
    submissionFeedback = submission?.feedback ?? null
    submissionScore = submission?.score ?? null
  }

  return (
    <LessonPlayer
      lesson={lessonWithTypedBlocks}
      courseId={courseId}
      nextLesson={nextLesson}
      homeworkMeta={homeworkMeta}
      submissionStatus={submissionStatus}
      submissionFeedback={submissionFeedback}
      submissionScore={submissionScore}
    />
  )
}
