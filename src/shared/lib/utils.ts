import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting has moved to @/shared/lib/date.ts
// Re-export for backwards compatibility
export { formatDateFull as formatDate, formatTime24 as formatTime } from '@/shared/lib/date'
