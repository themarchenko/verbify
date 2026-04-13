-- Seed data for development
-- Note: auth.users must be created via Supabase Auth API or dashboard.
-- This seed assumes the following test users exist in auth.users:
--   owner@test.com / test1234
--   teacher@test.com / test1234
--   student@test.com / test1234

-- Insert test school
insert into schools (id, name, slug, language)
values ('00000000-0000-0000-0000-000000000001', 'Spanish MK', 'spanishmk', 'es');

-- Profiles will be created after auth users are set up.
-- Example (replace UUIDs with actual auth.users IDs):
--
-- insert into profiles (id, school_id, role, full_name) values
--   ('<owner-auth-uid>', '00000000-0000-0000-0000-000000000001', 'owner', 'Maria Owner'),
--   ('<teacher-auth-uid>', '00000000-0000-0000-0000-000000000001', 'teacher', 'Ivan Teacher'),
--   ('<student-auth-uid>', '00000000-0000-0000-0000-000000000001', 'student', 'Anna Student');
