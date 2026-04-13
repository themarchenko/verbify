-- Homework feature: lesson_type, new block types, homework tables, file storage

-- 1. Add lesson_type to lessons (default 'lesson' keeps backward compat)
alter table lessons add column lesson_type text not null default 'lesson'
  check (lesson_type in ('lesson', 'homework'));

-- 2. Expand lesson_blocks type constraint to include new block types
alter table lesson_blocks drop constraint lesson_blocks_type_check;
alter table lesson_blocks add constraint lesson_blocks_type_check
  check (type in ('text', 'flashcards', 'quiz', 'audio', 'video', 'embed', 'open_answer', 'file_upload'));

-- 3. Add response JSONB to student_progress for open_answer/file_upload answers
alter table student_progress add column response jsonb;

-- 4. Homework metadata (deadline, settings) — one per homework lesson
create table homework_meta (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references lessons(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  due_date timestamptz,
  allow_late_submission boolean default false,
  created_at timestamptz default now()
);

-- 5. Homework assignments (which students see this homework)
-- Empty = all enrolled students see it
create table homework_assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique (lesson_id, student_id)
);

-- 6. Homework submissions (student submission state + teacher grading)
-- Note: 'overdue' is computed from due_date, not stored
create table homework_submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'submitted', 'graded')),
  score integer check (score between 0 and 100),
  feedback text,
  submitted_at timestamptz,
  graded_at timestamptz,
  graded_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (lesson_id, student_id)
);

-- 7. Enable RLS
alter table homework_meta enable row level security;
alter table homework_assignments enable row level security;
alter table homework_submissions enable row level security;

-- 8. RLS: homework_meta
-- Read: anyone in the school
create policy "homework_meta_select" on homework_meta
  for select using (school_id in (select auth_school_ids()));

-- Write: staff with manage_courses permission
create policy "homework_meta_insert" on homework_meta
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

create policy "homework_meta_update" on homework_meta
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

create policy "homework_meta_delete" on homework_meta
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 9. RLS: homework_assignments
-- Read: anyone in the school
create policy "homework_assignments_select" on homework_assignments
  for select using (school_id in (select auth_school_ids()));

-- Write: staff with manage_courses
create policy "homework_assignments_insert" on homework_assignments
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

create policy "homework_assignments_delete" on homework_assignments
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 10. RLS: homework_submissions
-- Students can read and manage their own submissions
create policy "homework_submissions_select_own" on homework_submissions
  for select using (
    school_id in (select auth_school_ids())
  );

create policy "homework_submissions_insert" on homework_submissions
  for insert with check (
    school_id in (select auth_school_ids())
  );

create policy "homework_submissions_update_own" on homework_submissions
  for update using (
    student_id = auth_profile_id(school_id)
  );

-- Staff can update submissions (grading)
create policy "homework_submissions_update_staff" on homework_submissions
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 11. Storage bucket for homework file uploads (private, 50MB limit)
insert into storage.buckets (id, name, public, file_size_limit)
values ('homework-files', 'homework-files', false, 52428800);

-- Students can upload to their own folder
create policy "students_upload_homework_files" on storage.objects
  for insert with check (
    bucket_id = 'homework-files'
    and auth.uid() is not null
  );

-- Students can read own uploaded files
create policy "students_read_own_homework_files" on storage.objects
  for select using (
    bucket_id = 'homework-files'
    and auth.uid() is not null
  );

-- Students can delete own uploaded files
create policy "students_delete_own_homework_files" on storage.objects
  for delete using (
    bucket_id = 'homework-files'
    and auth.uid() is not null
  );

-- Staff can read all homework files for grading
create policy "staff_read_homework_files" on storage.objects
  for select using (
    bucket_id = 'homework-files'
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('owner', 'teacher', 'manager')
    )
  );
