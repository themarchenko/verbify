-- Add expiration date to enrollments (null = permanent access)
alter table enrollments add column expires_at timestamptz;

-- Add missing UPDATE policy for enrollments
create policy "enrollments_update" on enrollments
  for update using (school_id in (select auth_school_ids()));
