import { createClient } from '@/shared/api/supabase.server'

const PAGE_SIZE = 30

export type StudentRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
}

export type StudentsPage = {
  students: StudentRow[]
  total: number
  hasMore: boolean
}

export async function getStudentsPaginated(
  schoolId: string,
  opts: { search?: string; courseId?: string; offset?: number; limit?: number } = {}
): Promise<StudentsPage> {
  const supabase = await createClient()
  const limit = opts.limit ?? PAGE_SIZE
  const offset = opts.offset ?? 0

  // If filtering by course, get enrolled student IDs first
  let enrolledStudentIds: string[] | null = null
  if (opts.courseId) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('course_id', opts.courseId)
      .eq('school_id', schoolId)

    enrolledStudentIds = (enrollments || []).map((e) => e.student_id).filter(Boolean) as string[]

    if (enrolledStudentIds.length === 0) {
      return { students: [], total: 0, hasMore: false }
    }
  }

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, created_at', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('role', 'student')

  if (opts.search) {
    query = query.ilike('full_name', `%${opts.search}%`)
  }

  if (enrolledStudentIds) {
    query = query.in('id', enrolledStudentIds)
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const total = count ?? 0

  return {
    students: (data || []) as StudentRow[],
    total,
    hasMore: offset + limit < total,
  }
}

export async function getStudentDetail(studentProfileId: string) {
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url, created_at, school_id')
    .eq('id', studentProfileId)
    .eq('role', 'student')
    .single()

  if (!student) return null

  // Enrollments with course info
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, expires_at, course_id, courses(id, title, is_published)')
    .eq('student_id', student.id)
    .eq('school_id', student.school_id!)

  // All progress for this student in this school
  const { data: progress } = await supabase
    .from('student_progress')
    .select('id, lesson_id, block_id, completed, score, attempts, completed_at')
    .eq('student_id', student.id)
    .eq('school_id', student.school_id!)

  // Get all lessons + blocks for enrolled courses to calculate completion rates
  const courseIds = (enrollments || [])
    .map((e) => (e.courses as unknown as { id: string })?.id)
    .filter(Boolean)

  let courseLessons: Array<{ id: string; course_id: string | null }> = []
  let lessonBlocks: Array<{ id: string; lesson_id: string | null }> = []

  if (courseIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, course_id')
      .in('course_id', courseIds)
      .eq('is_published', true)

    courseLessons = lessons || []

    if (courseLessons.length > 0) {
      const { data: blocks } = await supabase
        .from('lesson_blocks')
        .select('id, lesson_id')
        .in(
          'lesson_id',
          courseLessons.map((l) => l.id)
        )

      lessonBlocks = blocks || []
    }
  }

  // Build per-course analytics
  const courseAnalytics = (enrollments || [])
    .map((enrollment) => {
      const course = enrollment.courses as unknown as {
        id: string
        title: string
        is_published: boolean
      }
      if (!course) return null

      const lessons = courseLessons.filter((l) => l.course_id === course.id)
      const lessonIds = lessons.map((l) => l.id)
      const blocks = lessonBlocks.filter((b) => b.lesson_id && lessonIds.includes(b.lesson_id))
      const totalBlocks = blocks.length

      const completedBlocks = (progress || []).filter(
        (p) => p.completed && blocks.some((b) => b.id === p.block_id)
      )

      const scores = (progress || [])
        .filter((p) => p.score !== null && blocks.some((b) => b.id === p.block_id))
        .map((p) => p.score!)

      const avgScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

      return {
        enrollmentId: enrollment.id,
        courseId: course.id,
        courseTitle: course.title,
        isPublished: course.is_published,
        enrolledAt: enrollment.enrolled_at,
        expiresAt: enrollment.expires_at,
        totalLessons: lessons.length,
        totalBlocks,
        completedBlocks: completedBlocks.length,
        progressPercent:
          totalBlocks > 0 ? Math.round((completedBlocks.length / totalBlocks) * 100) : 0,
        avgScore,
      }
    })
    .filter(Boolean) as Array<{
    enrollmentId: string
    courseId: string
    courseTitle: string
    isPublished: boolean
    enrolledAt: string | null
    expiresAt: string | null
    totalLessons: number
    totalBlocks: number
    completedBlocks: number
    progressPercent: number
    avgScore: number | null
  }>

  // Aggregate stats
  const allProgress = progress || []
  const completedCount = allProgress.filter((p) => p.completed).length
  const totalBlocksAll = lessonBlocks.length
  const allScores = allProgress.filter((p) => p.score !== null).map((p) => p.score!)
  const overallAvgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null

  const lastActivity =
    allProgress
      .filter((p) => p.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]
      ?.completed_at || null

  return {
    student,
    stats: {
      coursesEnrolled: courseAnalytics.length,
      completedBlocks: completedCount,
      totalBlocks: totalBlocksAll,
      overallProgress: totalBlocksAll > 0 ? Math.round((completedCount / totalBlocksAll) * 100) : 0,
      overallAvgScore,
      totalAttempts: allProgress.reduce((sum, p) => sum + (p.attempts || 0), 0),
      lastActivity,
    },
    courses: courseAnalytics,
  }
}

export async function getAvailableCoursesForStudent(studentProfileId: string) {
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', studentProfileId)
    .single()

  if (!student?.school_id) return []

  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, title')
    .eq('school_id', student.school_id)
    .eq('is_published', true)
    .order('title')

  const { data: enrolledRows } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', studentProfileId)

  const enrolledIds = new Set((enrolledRows || []).map((e) => e.course_id))

  return (allCourses || []).filter((c) => !enrolledIds.has(c.id))
}
