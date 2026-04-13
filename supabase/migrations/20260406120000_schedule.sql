-- Teachers assigned to lessons (many-to-many)
CREATE TABLE lesson_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, teacher_id)
);

ALTER TABLE lesson_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_members_read_lesson_teachers"
  ON lesson_teachers FOR SELECT
  USING (school_id IN (SELECT auth_school_ids()));

CREATE POLICY "teachers_owners_manage_lesson_teachers"
  ON lesson_teachers FOR ALL
  USING (school_id IN (SELECT auth_school_ids()))
  WITH CHECK (school_id IN (SELECT auth_school_ids()));

-- Scheduled class sessions
CREATE TABLE class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_members_read_sessions"
  ON class_sessions FOR SELECT
  USING (school_id IN (SELECT auth_school_ids()));

CREATE POLICY "teachers_owners_manage_sessions"
  ON class_sessions FOR ALL
  USING (school_id IN (SELECT auth_school_ids()))
  WITH CHECK (school_id IN (SELECT auth_school_ids()));

-- Reminders for sessions (per user)
CREATE TABLE session_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  remind_minutes_before int NOT NULL DEFAULT 30,
  remind_at timestamptz NOT NULL,
  is_dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, profile_id)
);

ALTER TABLE session_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_reminders"
  ON session_reminders FOR ALL
  USING (school_id IN (SELECT auth_school_ids()))
  WITH CHECK (school_id IN (SELECT auth_school_ids()));
