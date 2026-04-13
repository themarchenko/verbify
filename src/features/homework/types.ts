export type HomeworkStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue'

export type HomeworkMeta = {
  id: string
  lesson_id: string
  school_id: string
  due_date: string | null
  allow_late_submission: boolean
}

export type HomeworkSubmission = {
  id: string
  lesson_id: string
  student_id: string
  school_id: string
  status: Exclude<HomeworkStatus, 'overdue'>
  score: number | null
  feedback: string | null
  submitted_at: string | null
  graded_at: string | null
  graded_by: string | null
}

export type HomeworkAssignment = {
  id: string
  lesson_id: string
  student_id: string
  school_id: string
  assigned_at: string
}
