-- Lesson settings: sequential blocks and require previous lesson completion
ALTER TABLE lessons ADD COLUMN sequential_blocks boolean DEFAULT true;
ALTER TABLE lessons ADD COLUMN require_previous_completion boolean DEFAULT true;

-- Lesson completions: track when students finish lessons
CREATE TABLE lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id),
  completed_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own completions"
  ON lesson_completions FOR SELECT
  USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "School staff can read all completions"
  ON lesson_completions FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM profiles
    WHERE user_id = auth.uid() AND role IN ('owner', 'teacher')
  ));
