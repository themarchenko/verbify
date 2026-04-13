export interface ClassSession {
  id: string
  school_id: string
  lesson_id: string | null
  teacher_id: string
  title: string
  scheduled_at: string
  duration_minutes: number
  notes: string | null
  created_at: string | null
}

export interface ClassSessionWithRelations extends ClassSession {
  teacher: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  lesson: {
    id: string
    title: string
    course_id: string | null
  } | null
  reminder: {
    id: string
    remind_minutes_before: number
    remind_at: string
    is_dismissed: boolean
  } | null
}

export interface LessonTeacher {
  id: string
  lesson_id: string
  teacher_id: string
  school_id: string
  created_at: string | null
  teacher: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface SessionReminder {
  id: string
  session_id: string
  profile_id: string
  school_id: string
  remind_minutes_before: number
  remind_at: string
  is_dismissed: boolean
  created_at: string | null
}

export interface UpcomingReminder {
  id: string
  session_id: string
  remind_at: string
  is_dismissed: boolean
  session: ClassSession & {
    teacher: { full_name: string | null }
  }
}
