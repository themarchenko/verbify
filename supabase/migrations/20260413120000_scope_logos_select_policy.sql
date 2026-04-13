-- Remove overly permissive public SELECT on school-logos bucket.
-- Public buckets serve files via direct URL without RLS,
-- so only owners (who call .list()) need the SELECT policy.

drop policy if exists "public_read_logos" on storage.objects;

create policy "owners_list_logos" on storage.objects
  for select using (
    bucket_id = 'school-logos'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role = 'owner'
    )
  );
