export type EnrolledCourse = {
  id: string
  title: string
  description: string | null
  lesson_count: number
  completed_count: number
  average_score: number | null
  expires_at: string | null
}

export type ContinueLearningData = {
  lesson_id: string
  lesson_title: string
  course_id: string
  course_title: string
  has_prior_activity: boolean
} | null

export type StudentStats = {
  overall_progress_percent: number
  average_score: number | null
  completed_lessons_count: number
  study_streak_days: number
}

export type StudentLesson = {
  id: string
  title: string
  order_index: number
  blocks: Array<{
    id: string
    type: string
    content: Record<string, unknown>
  }>
}
