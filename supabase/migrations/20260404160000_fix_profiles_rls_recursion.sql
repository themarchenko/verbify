-- Fix infinite recursion in profiles UPDATE/DELETE policies.
-- The profiles_update_staff and profiles_delete_staff policies contained
-- a direct subquery on profiles, which triggers RLS evaluation on the same
-- table and causes infinite recursion. Replace with the existing
-- auth_has_permission() security definer function that bypasses RLS.

drop policy if exists "profiles_update_staff" on profiles;
create policy "profiles_update_staff" on profiles
  for update using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_staff')
  );

drop policy if exists "profiles_delete_staff" on profiles;
create policy "profiles_delete_staff" on profiles
  for delete using (
    school_id in (select auth_school_ids())
    and auth_has_permission(school_id, 'manage_staff')
  );
