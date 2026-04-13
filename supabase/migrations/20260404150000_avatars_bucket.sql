-- Create storage bucket for user avatars (public, 2MB limit, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
);

-- Storage RLS: authenticated users can upload their own avatar
create policy "users_upload_avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: authenticated users can update their own avatar
create policy "users_update_avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: authenticated users can delete their own avatar
create policy "users_delete_avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: public read access for avatars
create policy "public_read_avatars" on storage.objects
  for select using (bucket_id = 'avatars');
