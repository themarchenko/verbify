-- The previous approach still caused recursion because Postgres evaluates
-- all SELECT policies with OR. We need a security definer function that
-- bypasses RLS to get the user's school_id.

create or replace function auth_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- Drop all existing profiles policies
drop policy if exists "users_read_own_profile" on profiles;
drop policy if exists "users_see_school_profiles" on profiles;
drop policy if exists "users_insert_own_profile" on profiles;
drop policy if exists "users_update_own_profile" on profiles;

-- Recreate clean policies using the function
create policy "profiles_select" on profiles
  for select using (school_id = auth_school_id() or id = auth.uid());

create policy "profiles_insert" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on profiles
  for update using (id = auth.uid());

-- Also fix all other table policies to use the function instead of subquery
drop policy if exists "users_see_own_school" on schools;
create policy "schools_select" on schools
  for select using (id = auth_school_id());

drop policy if exists "owners_update_school" on schools;
create policy "schools_update" on schools
  for update using (
    id = auth_school_id()
    and (select role from public.profiles where id = auth.uid()) = 'owner'
  );

drop policy if exists "users_see_own_school_courses" on courses;
create policy "courses_select" on courses
  for select using (school_id = auth_school_id());

drop policy if exists "owners_teachers_write_courses" on courses;
create policy "courses_insert" on courses
  for insert with check (school_id = auth_school_id());

drop policy if exists "owners_teachers_update_courses" on courses;
create policy "courses_update" on courses
  for update using (school_id = auth_school_id());

drop policy if exists "owners_teachers_delete_courses" on courses;
create policy "courses_delete" on courses
  for delete using (school_id = auth_school_id());

drop policy if exists "users_see_own_school_lessons" on lessons;
create policy "lessons_select" on lessons
  for select using (school_id = auth_school_id());

drop policy if exists "owners_teachers_write_lessons" on lessons;
create policy "lessons_insert" on lessons
  for insert with check (school_id = auth_school_id());

drop policy if exists "owners_teachers_update_lessons" on lessons;
create policy "lessons_update" on lessons
  for update using (school_id = auth_school_id());

drop policy if exists "owners_teachers_delete_lessons" on lessons;
create policy "lessons_delete" on lessons
  for delete using (school_id = auth_school_id());

drop policy if exists "users_see_own_school_blocks" on lesson_blocks;
create policy "blocks_select" on lesson_blocks
  for select using (school_id = auth_school_id());

drop policy if exists "owners_teachers_write_blocks" on lesson_blocks;
create policy "blocks_insert" on lesson_blocks
  for insert with check (school_id = auth_school_id());

drop policy if exists "owners_teachers_update_blocks" on lesson_blocks;
create policy "blocks_update" on lesson_blocks
  for update using (school_id = auth_school_id());

drop policy if exists "owners_teachers_delete_blocks" on lesson_blocks;
create policy "blocks_delete" on lesson_blocks
  for delete using (school_id = auth_school_id());

drop policy if exists "students_see_own_progress" on student_progress;
drop policy if exists "students_write_own_progress" on student_progress;
drop policy if exists "students_update_own_progress" on student_progress;
drop policy if exists "teachers_see_school_progress" on student_progress;

create policy "progress_select" on student_progress
  for select using (student_id = auth.uid() or school_id = auth_school_id());

create policy "progress_insert" on student_progress
  for insert with check (student_id = auth.uid());

create policy "progress_update" on student_progress
  for update using (student_id = auth.uid());

drop policy if exists "users_see_own_school_enrollments" on enrollments;
create policy "enrollments_select" on enrollments
  for select using (school_id = auth_school_id());

drop policy if exists "owners_teachers_write_enrollments" on enrollments;
create policy "enrollments_insert" on enrollments
  for insert with check (school_id = auth_school_id());

drop policy if exists "owners_teachers_delete_enrollments" on enrollments;
create policy "enrollments_delete" on enrollments
  for delete using (school_id = auth_school_id());
