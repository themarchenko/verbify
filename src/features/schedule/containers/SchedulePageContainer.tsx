'use client'

import { useTranslations } from 'next-intl'

import { CalendarView } from '../components/CalendarView'
import type { ClassSessionWithRelations } from '../model/schedule.types'

interface Props {
  sessions: ClassSessionWithRelations[]
  teachers: Array<{ id: string; full_name: string | null }>
  lessons: Array<{ id: string; title: string; course_title: string | null }>
  currentProfileId: string
  userRole: string
}

export function SchedulePageContainer({
  sessions,
  teachers,
  lessons,
  currentProfileId,
  userRole,
}: Props) {
  const t = useTranslations()

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('schedule.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('schedule.subtitle')}</p>
      </div>
      <div className="flex-1 min-h-0">
        <CalendarView
          sessions={sessions}
          teachers={teachers}
          lessons={lessons}
          currentProfileId={currentProfileId}
          userRole={userRole}
        />
      </div>
    </div>
  )
}
