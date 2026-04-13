-- Schools (tenants)
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#000000',
  language text default 'es',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing',
  subscription_plan text default 'starter',
  trial_ends_at timestamptz default now() + interval '14 days',
  created_at timestamptz default now()
);

-- User profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  school_id uuid references schools on delete cascade,
  role text not null check (role in ('owner', 'teacher', 'student')),
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade,
  title text not null,
  description text,
  cover_url text,
  is_published boolean default false,
  created_by uuid references profiles,
  created_at timestamptz default now()
);

-- Lessons
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses on delete cascade,
  school_id uuid references schools on delete cascade,
  title text not null,
  order_index integer not null default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Lesson blocks (the builder)
create table lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons on delete cascade,
  school_id uuid references schools on delete cascade,
  type text not null check (type in ('text', 'flashcards', 'quiz', 'audio', 'video', 'embed')),
  order_index integer not null default 0,
  content jsonb not null default '{}'
);

-- Student progress per block
create table student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles on delete cascade,
  lesson_id uuid references lessons on delete cascade,
  block_id uuid references lesson_blocks on delete cascade,
  school_id uuid references schools on delete cascade,
  completed boolean default false,
  score integer check (score between 0 and 100),
  attempts integer default 0,
  completed_at timestamptz,
  unique (student_id, block_id)
);

-- Course enrollments
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles on delete cascade,
  course_id uuid references courses on delete cascade,
  school_id uuid references schools on delete cascade,
  enrolled_at timestamptz default now(),
  unique (student_id, course_id)
);

-- Row Level Security
alter table schools enable row level security;
alter table profiles enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_blocks enable row level security;
alter table student_progress enable row level security;
alter table enrollments enable row level security;

-- RLS Policies: users can only see data from their own school
create policy "users_see_own_school" on schools
  for select using (id = (select school_id from profiles where id = auth.uid()));

create policy "users_see_own_school_profiles" on profiles
  for select using (school_id = (select school_id from profiles where id = auth.uid()));

create policy "users_insert_own_profile" on profiles
  for insert with check (id = auth.uid());

create policy "users_see_own_school_courses" on courses
  for select using (school_id = (select school_id from profiles where id = auth.uid()));

create policy "owners_teachers_write_courses" on courses
  for insert with check (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_update_courses" on courses
  for update using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_delete_courses" on courses
  for delete using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "users_see_own_school_lessons" on lessons
  for select using (school_id = (select school_id from profiles where id = auth.uid()));

create policy "owners_teachers_write_lessons" on lessons
  for insert with check (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_update_lessons" on lessons
  for update using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_delete_lessons" on lessons
  for delete using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "users_see_own_school_blocks" on lesson_blocks
  for select using (school_id = (select school_id from profiles where id = auth.uid()));

create policy "owners_teachers_write_blocks" on lesson_blocks
  for insert with check (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_update_blocks" on lesson_blocks
  for update using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_delete_blocks" on lesson_blocks
  for delete using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "students_see_own_progress" on student_progress
  for select using (student_id = auth.uid());

create policy "students_write_own_progress" on student_progress
  for insert with check (student_id = auth.uid());

create policy "students_update_own_progress" on student_progress
  for update using (student_id = auth.uid());

-- Teachers/owners can also read student progress for their school
create policy "teachers_see_school_progress" on student_progress
  for select using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "users_see_own_school_enrollments" on enrollments
  for select using (school_id = (select school_id from profiles where id = auth.uid()));

create policy "owners_teachers_write_enrollments" on enrollments
  for insert with check (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

create policy "owners_teachers_delete_enrollments" on enrollments
  for delete using (
    school_id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('owner', 'teacher')
  );

-- Owners can update their own school
create policy "owners_update_school" on schools
  for update using (
    id = (select school_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'owner'
  );
