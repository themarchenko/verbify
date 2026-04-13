-- Support multi-school profiles: one auth.users entry can have profiles in multiple schools.
-- This enables white-label multi-tenancy where the same email can exist across schools.

-- 1. Add user_id column and populate from existing id values
alter table profiles add column user_id uuid;
update profiles set user_id = id;
alter table profiles alter column user_id set not null;

-- 2. Drop the FK from profiles.id -> auth.users (keep id as PK)
alter table profiles drop constraint profiles_id_fkey;

-- 3. Set auto-generated default on id for new rows
alter table profiles alter column id set default gen_random_uuid();

-- 4. Add FK from user_id -> auth.users
alter table profiles
  add constraint profiles_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- 5. One profile per user per school
alter table profiles
  add constraint profiles_user_school_unique
  unique (user_id, school_id);

-- 6. Update auth_school_id() to use user_id
create or replace function auth_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select school_id from public.profiles where user_id = auth.uid() limit 1
$$;

-- 7. Helper: get all school_ids for the current user
create or replace function auth_school_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select school_id from public.profiles where user_id = auth.uid()
$$;

-- 8. Helper: get profile id for current user in a given school
create or replace function auth_profile_id(p_school_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles where user_id = auth.uid() and school_id = p_school_id
$$;

-- 9. Update RLS policies to support multi-school access

-- Profiles: see profiles from any school I belong to
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles
  for select using (
    school_id in (select auth_school_ids())
    or user_id = auth.uid()
  );

-- Profiles: insert own profile (admin inserts bypass RLS)
drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles
  for insert with check (user_id = auth.uid());

-- Profiles: update own profiles
drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles
  for update using (user_id = auth.uid());

-- Schools: see any school I belong to
drop policy if exists "schools_select" on schools;
create policy "schools_select" on schools
  for select using (id in (select auth_school_ids()));

drop policy if exists "schools_update" on schools;
create policy "schools_update" on schools
  for update using (
    id in (select auth_school_ids())
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and school_id = id and role = 'owner'
    )
  );

-- Courses
drop policy if exists "courses_select" on courses;
create policy "courses_select" on courses
  for select using (school_id in (select auth_school_ids()));

drop policy if exists "courses_insert" on courses;
create policy "courses_insert" on courses
  for insert with check (school_id in (select auth_school_ids()));

drop policy if exists "courses_update" on courses;
create policy "courses_update" on courses
  for update using (school_id in (select auth_school_ids()));

drop policy if exists "courses_delete" on courses;
create policy "courses_delete" on courses
  for delete using (school_id in (select auth_school_ids()));

-- Lessons
drop policy if exists "lessons_select" on lessons;
create policy "lessons_select" on lessons
  for select using (school_id in (select auth_school_ids()));

drop policy if exists "lessons_insert" on lessons;
create policy "lessons_insert" on lessons
  for insert with check (school_id in (select auth_school_ids()));

drop policy if exists "lessons_update" on lessons;
create policy "lessons_update" on lessons
  for update using (school_id in (select auth_school_ids()));

drop policy if exists "lessons_delete" on lessons;
create policy "lessons_delete" on lessons
  for delete using (school_id in (select auth_school_ids()));

-- Lesson blocks
drop policy if exists "blocks_select" on lesson_blocks;
create policy "blocks_select" on lesson_blocks
  for select using (school_id in (select auth_school_ids()));

drop policy if exists "blocks_insert" on lesson_blocks;
create policy "blocks_insert" on lesson_blocks
  for insert with check (school_id in (select auth_school_ids()));

drop policy if exists "blocks_update" on lesson_blocks;
create policy "blocks_update" on lesson_blocks
  for update using (school_id in (select auth_school_ids()));

drop policy if exists "blocks_delete" on lesson_blocks;
create policy "blocks_delete" on lesson_blocks
  for delete using (school_id in (select auth_school_ids()));

-- Student progress: student can manage own progress (via profile id in any school)
drop policy if exists "progress_select" on student_progress;
create policy "progress_select" on student_progress
  for select using (
    school_id in (select auth_school_ids())
  );

drop policy if exists "progress_insert" on student_progress;
create policy "progress_insert" on student_progress
  for insert with check (
    school_id in (select auth_school_ids())
  );

drop policy if exists "progress_update" on student_progress;
create policy "progress_update" on student_progress
  for update using (
    school_id in (select auth_school_ids())
  );

-- Enrollments
drop policy if exists "enrollments_select" on enrollments;
create policy "enrollments_select" on enrollments
  for select using (school_id in (select auth_school_ids()));

drop policy if exists "enrollments_insert" on enrollments;
create policy "enrollments_insert" on enrollments
  for insert with check (school_id in (select auth_school_ids()));

drop policy if exists "enrollments_delete" on enrollments;
create policy "enrollments_delete" on enrollments
  for delete using (school_id in (select auth_school_ids()));
