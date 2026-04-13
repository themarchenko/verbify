import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const schoolId = '00000000-0000-0000-0000-000000000001'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const users = [
  {
    email: 'owner@test.com',
    password: 'test1234',
    role: 'owner',
    fullName: 'Maria Owner',
    permissions: [] as string[],
  },
  {
    email: 'teacher@test.com',
    password: 'test1234',
    role: 'teacher',
    fullName: 'Ivan Teacher',
    permissions: ['manage_courses', 'manage_students'],
  },
  {
    email: 'manager@test.com',
    password: 'test1234',
    role: 'manager',
    fullName: 'Olena Manager',
    permissions: ['manage_students'],
  },
  {
    email: 'student@test.com',
    password: 'test1234',
    role: 'student',
    fullName: 'Anna Student',
    permissions: [] as string[],
  },
] as const

async function main() {
  // Clean existing profiles and auth users for this school
  console.log('Cleaning existing data...')

  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('school_id', schoolId)

  if (existingProfiles && existingProfiles.length > 0) {
    // Delete profiles first
    await supabase.from('profiles').delete().eq('school_id', schoolId)
    console.log(`Deleted ${existingProfiles.length} existing profiles`)

    // Delete auth users
    for (const profile of existingProfiles) {
      await supabase.auth.admin.deleteUser(profile.user_id)
    }
    console.log(`Deleted ${existingProfiles.length} auth users`)
  }

  // Ensure school exists
  const { error: schoolError } = await supabase
    .from('schools')
    .upsert(
      { id: schoolId, name: 'Spanish MK', slug: 'spanishmk', language: 'es' },
      { onConflict: 'id' }
    )
  if (schoolError) {
    console.error('Failed to upsert school:', schoolError.message)
  }

  // Delete any orphaned auth users with our test emails
  const { data: allAuthUsers } = await supabase.auth.admin.listUsers()
  const testEmails: string[] = users.map((u) => u.email)
  for (const authUser of allAuthUsers?.users || []) {
    if (testEmails.includes(authUser.email!)) {
      await supabase.auth.admin.deleteUser(authUser.id)
      console.log(`Deleted orphaned auth user: ${authUser.email}`)
    }
  }

  // Create users and profiles
  for (const user of users) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    })

    if (authError) {
      console.error(`Failed to create ${user.email}:`, authError.message)
      continue
    }

    console.log(`Created auth user: ${user.email} (${authData.user.id})`)

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      school_id: schoolId,
      role: user.role,
      full_name: user.fullName,
      permissions: user.permissions,
    })

    if (profileError) {
      console.error(`Failed to create profile for ${user.email}:`, profileError.message)
    } else {
      console.log(`Profile created: ${user.email} as ${user.role} [${user.permissions.join(', ')}]`)
    }
  }

  console.log('Done seeding users.')
}

main()
