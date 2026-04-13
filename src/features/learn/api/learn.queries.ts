import { createClient } from '@/shared/api/supabase.server'

import type { ContinueLearningData, StudentStats } from '../types'

async function getStudentProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return profile
}

export async function getEnrolledCourses() {
  const supabase = await createClient()
  const profile = await getStudentProfile()
  if (!profile) return []

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, expires_at, courses(id, title, description, is_published)')
    .eq('student_id', profile.id)

  if (!enrollments) return []

  const courses = []
  for (const enrollment of enrollments) {
    const course = enrollment.courses as unknown as {
      id: string
      title: string
      description: string | null
      is_published: boolean | null
    }
    if (!course || !course.is_published) continue

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)
      .eq('is_published', true)

    const lessonIds = (lessons || []).map((l) => l.id)
    const lessonCount = lessonIds.length

    let completedCount = 0
    let averageScore: number | null = null

    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from('lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .in('lesson_id', lessonIds)

      completedCount = count || 0

      const { data: scoreData } = await supabase
        .from('student_progress')
        .select('score')
        .eq('student_id', profile.id)
        .in('lesson_id', lessonIds)
        .not('score', 'is', null)

      if (scoreData && scoreData.length > 0) {
        const total = scoreData.reduce((sum, row) => sum + (row.score ?? 0), 0)
        averageScore = Math.round(total / scoreData.length)
      }
    }

    courses.push({
      id: course.id,
      title: course.title,
      description: course.description,
      lesson_count: lessonCount,
      completed_count: completedCount,
      average_score: averageScore,
      expires_at: enrollment.expires_at,
    })
  }

  return courses
}

export async function getStudentStats(): Promise<StudentStats> {
  const supabase = await createClient()
  const profile = await getStudentProfile()
  if (!profile) {
    return {
      overall_progress_percent: 0,
      average_score: null,
      completed_lessons_count: 0,
      study_streak_days: 0,
    }
  }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', profile.id)

  const courseIds = (enrollments || []).map((e) => e.course_id).filter(Boolean) as string[]

  let totalLessons = 0
  if (courseIds.length > 0) {
    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('is_published', true)
    totalLessons = count || 0
  }

  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('completed_at')
    .eq('student_id', profile.id)

  const completedLessonsCount = completions?.length || 0
  const overallProgressPercent =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0

  const { data: scoreData } = await supabase
    .from('student_progress')
    .select('score')
    .eq('student_id', profile.id)
    .not('score', 'is', null)

  let averageScore: number | null = null
  if (scoreData && scoreData.length > 0) {
    const total = scoreData.reduce((sum, row) => sum + (row.score ?? 0), 0)
    averageScore = Math.round(total / scoreData.length)
  }

  // Calculate study streak from completion timestamps
  const { data: progressDates } = await supabase
    .from('student_progress')
    .select('completed_at')
    .eq('student_id', profile.id)
    .not('completed_at', 'is', null)

  const allDates = new Set<string>()
  for (const row of completions || []) {
    if (row.completed_at) allDates.add(row.completed_at.substring(0, 10))
  }
  for (const row of progressDates || []) {
    if (row.completed_at) allDates.add(row.completed_at.substring(0, 10))
  }

  const studyStreakDays = calculateStreak(Array.from(allDates))

  return {
    overall_progress_percent: overallProgressPercent,
    average_score: averageScore,
    completed_lessons_count: completedLessonsCount,
    study_streak_days: studyStreakDays,
  }
}

function calculateStreak(dateStrings: string[]): number {
  if (dateStrings.length === 0) return 0

  const sorted = dateStrings.sort().reverse()
  const today = new Date().toISOString().substring(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10)

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  let current = new Date(sorted[0])

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(current.getTime() - 86400000).toISOString().substring(0, 10)
    if (sorted[i] === prev) {
      streak++
      current = new Date(sorted[i])
    } else if (sorted[i] !== current.toISOString().substring(0, 10)) {
      break
    }
  }

  return streak
}

export async function getContinueLearning(): Promise<ContinueLearningData> {
  const supabase = await createClient()
  const profile = await getStudentProfile()
  if (!profile) return null

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, expires_at, courses(id, title, is_published)')
    .eq('student_id', profile.id)

  if (!enrollments || enrollments.length === 0) return null

  // Filter active, published courses
  const activeCourses = enrollments
    .filter((e) => {
      const course = e.courses as unknown as { id: string; is_published: boolean | null }
      return course?.is_published && (!e.expires_at || new Date(e.expires_at) >= new Date())
    })
    .map((e) => ({
      ...(e.courses as unknown as { id: string; title: string }),
      course_id: e.course_id,
    }))

  if (activeCourses.length === 0) return null

  // Check if student has any prior activity
  const { count: progressCount } = await supabase
    .from('student_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', profile.id)

  const { data: allCompletions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('student_id', profile.id)

  const completedLessonIds = new Set((allCompletions || []).map((c) => c.lesson_id))
  const hasPriorActivity = (progressCount ?? 0) > 0 || completedLessonIds.size > 0

  // Find last completed lesson to determine the most recently active course
  const { data: lastCompletion } = await supabase
    .from('lesson_completions')
    .select('lesson_id, completed_at, lessons(course_id)')
    .eq('student_id', profile.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  // Try to find next lesson in the most recently active course first
  if (lastCompletion) {
    const lastCourseId = (lastCompletion.lessons as unknown as { course_id: string })?.course_id
    const activeCourse = activeCourses.find((c) => c.id === lastCourseId)

    if (activeCourse) {
      const nextLesson = await findNextIncompleteLesson(
        supabase,
        activeCourse.id,
        completedLessonIds
      )
      if (nextLesson) {
        return {
          lesson_id: nextLesson.id,
          lesson_title: nextLesson.title,
          course_id: activeCourse.id,
          course_title: activeCourse.title,
          has_prior_activity: hasPriorActivity,
        }
      }
    }
  }

  // Fall back to first course with incomplete lessons
  for (const course of activeCourses) {
    const nextLesson = await findNextIncompleteLesson(supabase, course.id, completedLessonIds)
    if (nextLesson) {
      return {
        lesson_id: nextLesson.id,
        lesson_title: nextLesson.title,
        course_id: course.id,
        course_title: course.title,
        has_prior_activity: hasPriorActivity,
      }
    }
  }

  return null
}

async function findNextIncompleteLesson(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  completedLessonIds: Set<string | null>
) {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('order_index')

  if (!lessons) return null

  return lessons.find((l) => !completedLessonIds.has(l.id)) || null
}

export type CourseAccessStatus = { status: 'active' } | { status: 'expired' } | { status: 'denied' }

export async function checkCourseAccess(courseId: string): Promise<CourseAccessStatus> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: 'denied' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { status: 'denied' }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, expires_at')
    .eq('student_id', profile.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) return { status: 'denied' }

  if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
    return { status: 'expired' }
  }

  return { status: 'active' }
}

export async function getLessonForStudent(lessonId: string) {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(
      'id, title, order_index, course_id, sequential_blocks, require_previous_completion, lesson_type'
    )
    .eq('id', lessonId)
    .eq('is_published', true)
    .single()

  if (!lesson) return null

  const { data: blocks } = await supabase
    .from('lesson_blocks')
    .select('id, type, content')
    .eq('lesson_id', lessonId)
    .order('order_index')

  return {
    ...lesson,
    blocks: blocks || [],
  }
}

export async function getCourseLessonsWithLockStatus(courseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return []

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_index, require_previous_completion, lesson_type')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('order_index')

  if (!lessons || lessons.length === 0) return []

  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('student_id', profile.id)

  const completedIds = new Set((completions || []).map((c) => c.lesson_id))

  return lessons.map((lesson, index) => {
    const previousLesson = index > 0 ? lessons[index - 1] : null
    const isLocked =
      (lesson.require_previous_completion ?? true) &&
      previousLesson !== null &&
      !completedIds.has(previousLesson.id)

    return {
      id: lesson.id,
      title: lesson.title,
      order_index: lesson.order_index,
      lesson_type: lesson.lesson_type,
      isLocked,
      isCompleted: completedIds.has(lesson.id),
    }
  })
}

export async function isLessonAccessible(lessonId: string, courseId: string) {
  const lessons = await getCourseLessonsWithLockStatus(courseId)
  const lesson = lessons.find((l) => l.id === lessonId)
  return lesson ? !lesson.isLocked : true
}

export async function getNextLesson(courseId: string, currentOrderIndex: number) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .gt('order_index', currentOrderIndex)
    .order('order_index')
    .limit(1)
    .single()

  return data
}
