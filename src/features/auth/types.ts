export type UserRole = 'owner' | 'teacher' | 'manager' | 'student'

export type StaffPermission =
  | 'manage_courses'
  | 'manage_students'
  | 'manage_staff'
  | 'manage_settings'
  | 'manage_billing'

export const ALL_PERMISSIONS: StaffPermission[] = [
  'manage_courses',
  'manage_students',
  'manage_staff',
  'manage_settings',
  'manage_billing',
]

export type Profile = {
  id: string
  user_id: string
  school_id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  permissions: StaffPermission[]
}
