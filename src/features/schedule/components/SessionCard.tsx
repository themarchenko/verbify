'use client'

import { useLocale, useTranslations } from 'next-intl'

import { addMinutes, formatTime24 } from '@/shared/lib/date'
import { Clock, User } from 'lucide-react'

import type { ClassSessionWithRelations } from '../model/schedule.types'

interface SessionCardProps {
  session: ClassSessionWithRelations
  onClick?: () => void
  compact?: boolean
}

const TEACHER_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-green-100 border-green-300 text-green-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-amber-100 border-amber-300 text-amber-900',
  'bg-rose-100 border-rose-300 text-rose-900',
  'bg-cyan-100 border-cyan-300 text-cyan-900',
]

function getColorForTeacher(teacherId: string): string {
  let hash = 0
  for (let i = 0; i < teacherId.length; i++) {
    hash = (hash * 31 + teacherId.charCodeAt(i)) & 0xffff
  }
  return TEACHER_COLORS[hash % TEACHER_COLORS.length]
}

export function SessionCard({ session, onClick, compact = false }: SessionCardProps) {
  const t = useTranslations()
  const locale = useLocale()
  const colorClass = getColorForTeacher(session.teacher_id)

  const start = new Date(session.scheduled_at)
  const startTime = formatTime24(start, locale)
  const endTime = formatTime24(addMinutes(start, session.duration_minutes), locale)

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left px-2 py-1 rounded border text-xs font-medium truncate ${colorClass} hover:opacity-80 transition-opacity`}
      >
        <span className="font-semibold">{startTime}</span> {session.title}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md border ${colorClass} hover:opacity-80 transition-opacity`}
    >
      <p className="text-sm font-semibold leading-tight truncate">{session.title}</p>
      <div className="flex items-center gap-3 mt-1">
        <span className="flex items-center gap-1 text-xs opacity-75">
          <Clock size={11} />
          {startTime} – {endTime}
        </span>
        <span className="flex items-center gap-1 text-xs opacity-75">
          <User size={11} />
          {session.teacher?.full_name || t('staff.unnamed')}
        </span>
      </div>
      {session.lesson && (
        <p className="text-xs mt-0.5 opacity-60 truncate">{session.lesson.title}</p>
      )}
      {session.reminder && !session.reminder.is_dismissed && (
        <span className="inline-block mt-1 text-[10px] bg-black/10 rounded px-1 py-0.5">
          {t('schedule.reminder')} {session.reminder.remind_minutes_before}{' '}
          {t('schedule.minBefore')}
        </span>
      )}
    </button>
  )
}
