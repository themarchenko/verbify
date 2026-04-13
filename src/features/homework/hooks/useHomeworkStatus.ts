import type { HomeworkMeta, HomeworkStatus, HomeworkSubmission } from '../types'

export function computeHomeworkStatus(
  submission: HomeworkSubmission | null,
  meta: HomeworkMeta | null
): HomeworkStatus {
  if (submission?.status === 'graded') return 'graded'
  if (submission?.status === 'submitted') return 'submitted'

  if (meta?.due_date && new Date(meta.due_date) < new Date()) {
    if (!submission || submission.status === 'not_started' || submission.status === 'in_progress') {
      return 'overdue'
    }
  }

  if (submission?.status === 'in_progress') return 'in_progress'
  return 'not_started'
}
