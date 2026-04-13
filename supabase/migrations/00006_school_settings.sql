-- Add custom domain and color scheme columns to schools
alter table schools add column custom_domain text;
alter table schools add column color_scheme text default 'default';

-- Create storage bucket for school logos (public, 2MB limit, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-logos',
  'school-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
);

-- Storage RLS: owners can upload logos
create policy "owners_upload_logos" on storage.objects
  for insert with check (
    bucket_id = 'school-logos'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Storage RLS: owners can update logos
create policy "owners_update_logos" on storage.objects
  for update using (
    bucket_id = 'school-logos'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Storage RLS: owners can delete logos
create policy "owners_delete_logos" on storage.objects
  for delete using (
    bucket_id = 'school-logos'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Storage RLS: public read access for logos
create policy "public_read_logos" on storage.objects
  for select using (bucket_id = 'school-logos');
