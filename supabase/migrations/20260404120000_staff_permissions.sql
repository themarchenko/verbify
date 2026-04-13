-- Add manager role and granular permissions system for staff members.
-- Permissions are stored as a text array on profiles.
-- Owner always has all permissions implicitly (no need to store them).

-- 0. Update role check constraint to include 'manager'
alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('owner', 'teacher', 'manager', 'student'));

-- 1. Add permissions column to profiles
alter table profiles add column permissions text[] not null default '{}';

-- 2. Set default permissions for existing teachers
update profiles
set permissions = array['manage_courses', 'manage_students']
where role = 'teacher';

-- 3. Create a helper function to check if current user has a specific permission
-- Owner role implicitly has all permissions; others check the array.
create or replace function auth_has_permission(p_school_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and school_id = p_school_id
      and (role = 'owner' or p_permission = any(permissions))
  )
$$;

-- 4. Update profiles RLS: owners and users with manage_staff can update other profiles in their school
drop policy if exists "profiles_update" on profiles;

-- Users can update their own profile (name, avatar etc)
create policy "profiles_update_own" on profiles
  for update using (user_id = auth.uid());

-- Owners and staff managers can update other profiles in their school (role, permissions)
create policy "profiles_update_staff" on profiles
  for update using (
    school_id in (select auth_school_ids())
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.school_id = profiles.school_id
        and (p.role = 'owner' or 'manage_staff' = any(p.permissions))
    )
  );

-- 5. Allow owners / staff managers to delete profiles (remove staff from school)
create policy "profiles_delete_staff" on profiles
  for delete using (
    school_id in (select auth_school_ids())
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.school_id = profiles.school_id
        and (p.role = 'owner' or 'manage_staff' = any(p.permissions))
    )
  );

-- 6. Update enrollments to allow managers with manage_students permission
drop policy if exists "enrollments_insert" on enrollments;
create policy "enrollments_insert" on enrollments
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_students')
  );

drop policy if exists "enrollments_delete" on enrollments;
create policy "enrollments_delete" on enrollments
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_students')
  );

-- 7. Update courses write policies to check manage_courses permission
drop policy if exists "courses_insert" on courses;
create policy "courses_insert" on courses
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "courses_update" on courses;
create policy "courses_update" on courses
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "courses_delete" on courses;
create policy "courses_delete" on courses
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 8. Update lessons write policies
drop policy if exists "lessons_insert" on lessons;
create policy "lessons_insert" on lessons
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "lessons_update" on lessons;
create policy "lessons_update" on lessons
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "lessons_delete" on lessons;
create policy "lessons_delete" on lessons
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 9. Update lesson_blocks write policies
drop policy if exists "blocks_insert" on lesson_blocks;
create policy "blocks_insert" on lesson_blocks
  for insert with check (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "blocks_update" on lesson_blocks;
create policy "blocks_update" on lesson_blocks
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

drop policy if exists "blocks_delete" on lesson_blocks;
create policy "blocks_delete" on lesson_blocks
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_courses')
  );

-- 10. Schools update: allow owners or users with manage_settings
drop policy if exists "schools_update" on schools;
drop policy if exists "schools_update_v2" on schools;
create policy "schools_update" on schools
  for update using (
    id in (select auth_school_ids())
    and auth_has_permission(id, 'manage_settings')
  );
