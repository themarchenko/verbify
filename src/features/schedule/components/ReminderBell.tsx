'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'

import { formatDateShort, formatTime24 } from '@/shared/lib/date'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { dismissReminder } from '../api/schedule.mutations'
import type { UpcomingReminder } from '../model/schedule.types'

interface Props {
  initialReminders: UpcomingReminder[]
}

export function ReminderBell({ initialReminders }: Props) {
  const t = useTranslations()
  const locale = useLocale()
  const [reminders, setReminders] = useState(initialReminders)
  const [, startTransition] = useTransition()

  // Periodically refresh reminders from server
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/schedule/reminders')
      if (res.ok) {
        const data = await res.json()
        setReminders(data)
      }
    }, 60_000) // every minute
    return () => clearInterval(interval)
  }, [])

  function handleDismiss(reminderId: string) {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    startTransition(async () => {
      await dismissReminder(reminderId)
    })
  }

  const count = reminders.length

  function fmtTime(iso: string) {
    return formatTime24(iso, locale)
  }

  function fmtDate(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return t('schedule.today')
    return formatDateShort(iso, locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('schedule.upcomingReminders')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {t('schedule.noReminders')}
          </div>
        ) : (
          reminders.map((r) => (
            <DropdownMenuItem
              key={r.id}
              className="flex items-start gap-2 p-3 cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.session.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {fmtDate(r.session.scheduled_at)} {t('schedule.at')}{' '}
                  {fmtTime(r.session.scheduled_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.session.teacher?.full_name || ''}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(r.id)}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
