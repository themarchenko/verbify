import type { UserRole } from '../types'

export function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case 'owner':
    case 'teacher':
    case 'manager':
      return '/dashboard'
    case 'student':
      return '/learn'
  }
}
