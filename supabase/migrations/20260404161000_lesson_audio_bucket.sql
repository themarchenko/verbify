-- Create storage bucket for lesson audio files (public, 50MB limit, audio only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-audio',
  'lesson-audio',
  true,
  52428800,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/ogg', 'audio/webm']
);

-- Storage RLS: owners and teachers can upload audio
create policy "staff_upload_lesson_audio" on storage.objects
  for insert with check (
    bucket_id = 'lesson-audio'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('owner', 'teacher')
    )
  );

-- Storage RLS: owners and teachers can update audio
create policy "staff_update_lesson_audio" on storage.objects
  for update using (
    bucket_id = 'lesson-audio'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('owner', 'teacher')
    )
  );

-- Storage RLS: owners and teachers can delete audio
create policy "staff_delete_lesson_audio" on storage.objects
  for delete using (
    bucket_id = 'lesson-audio'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and role in ('owner', 'teacher')
    )
  );

-- Storage RLS: public read access for lesson audio (students need to play it)
create policy "public_read_lesson_audio" on storage.objects
  for select using (bucket_id = 'lesson-audio');
