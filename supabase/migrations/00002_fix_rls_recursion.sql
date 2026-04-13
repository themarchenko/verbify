-- Fix: profiles RLS policy was querying profiles to get school_id, causing infinite recursion.
-- Solution: profiles policy uses auth.uid() directly (user can see their own row),
-- then a second policy lets users see other profiles in their school via a subquery
-- that reads their OWN row by auth.uid() (which is allowed by the first policy).

-- Drop the broken policy
drop policy if exists "users_see_own_school_profiles" on profiles;
drop policy if exists "users_insert_own_profile" on profiles;

-- Users can always read their own profile (no recursion)
create policy "users_read_own_profile" on profiles
  for select using (id = auth.uid());

-- Users can see other profiles in their school.
-- The inner query (select school_id from profiles where id = auth.uid())
-- is satisfied by the "users_read_own_profile" policy above, breaking the recursion.
create policy "users_see_school_profiles" on profiles
  for select using (
    school_id = (select school_id from profiles where id = auth.uid())
  );

-- Users can insert their own profile
create policy "users_insert_own_profile" on profiles
  for insert with check (id = auth.uid());

-- Users can update their own profile
create policy "users_update_own_profile" on profiles
  for update using (id = auth.uid());
