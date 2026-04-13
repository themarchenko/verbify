export type Course = {
  id: string
  school_id: string
  title: string
  description: string | null
  cover_url: string | null
  is_published: boolean
  created_by: string
  created_at: string
}

export type CourseWithStats = Course & {
  lesson_count: number
  student_count: number
}
