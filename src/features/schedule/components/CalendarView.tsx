'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState, useTransition } from 'react'

import { formatDayHeader, formatWeekRange, toISODateString } from '@/shared/lib/date'
import { ChevronLeft, ChevronRight, CopyIcon, Filter, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { createSessionsBulk } from '../api/schedule.mutations'
import type { ClassSessionWithRelations } from '../model/schedule.types'
import { CreateSessionDialog } from './CreateSessionDialog'
import { SessionCard } from './SessionCard'

interface Props {
  sessions: ClassSessionWithRelations[]
  teachers: Array<{ id: string; full_name: string | null }>
  lessons: Array<{ id: string; title: string; course_title: string | null }>
  currentProfileId: string
  userRole: string
}

const HOUR_START = 7
const HOUR_END = 21
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const CELL_H = 60 // px per hour

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function CalendarView({ sessions, teachers, lessons, currentProfileId, userRole }: Props) {
  const t = useTranslations()
  const locale = useLocale()
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedSession, setSelectedSession] = useState<ClassSessionWithRelations | null>(null)
  const [createAt, setCreateAt] = useState<{ date: string; hour: number } | null>(null)
  const [filterTeacherId, setFilterTeacherId] = useState('')
  const [filterLessonId, setFilterLessonId] = useState('')
  const [isCopying, startCopying] = useTransition()

  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate])
  const today = toISODateString(new Date())

  const filteredSessions = useMemo(() => {
    let result = sessions
    if (filterTeacherId) {
      result = result.filter((s) => s.teacher_id === filterTeacherId)
    }
    if (filterLessonId) {
      result = result.filter((s) => s.lesson_id === filterLessonId)
    }
    return result
  }, [sessions, filterTeacherId, filterLessonId])

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const map: Record<string, ClassSessionWithRelations[]> = {}
    for (const s of filteredSessions) {
      const day = toISODateString(new Date(s.scheduled_at))
      if (!map[day]) map[day] = []
      map[day].push(s)
    }
    return map
  }, [filteredSessions])

  function goToPrevWeek() {
    setAnchorDate((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() - 7)
      return next
    })
  }

  function goToNextWeek() {
    setAnchorDate((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() + 7)
      return next
    })
  }

  function goToToday() {
    setAnchorDate(new Date())
  }

  const weekLabel = formatWeekRange(weekDates[0], weekDates[6], locale)

  const canCreate = userRole === 'owner' || userRole === 'teacher'

  const currentWeekSessions = useMemo(() => {
    const start = toISODateString(weekDates[0])
    const end = toISODateString(weekDates[6])
    return sessions.filter((s) => {
      const d = toISODateString(new Date(s.scheduled_at))
      return d >= start && d <= end
    })
  }, [sessions, weekDates])

  function handleCopyWeek() {
    if (currentWeekSessions.length === 0) return
    const copies = currentWeekSessions.map((s) => ({
      title: s.title,
      teacher_id: s.teacher_id,
      lesson_id: s.lesson_id,
      duration_minutes: s.duration_minutes,
      notes: s.notes,
      scheduled_at: new Date(
        new Date(s.scheduled_at).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }))
    startCopying(async () => {
      await createSessionsBulk(copies)
      goToNextWeek()
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevWeek}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t('schedule.today')}
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight size={16} />
          </Button>
          <span className="text-sm font-medium ml-2">{weekLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={filterTeacherId} onValueChange={(v) => setFilterTeacherId(v ?? '')}>
            <SelectTrigger className="h-8 text-xs min-w-[140px]">
              <SelectValue>
                {filterTeacherId
                  ? teachers.find((tc) => tc.id === filterTeacherId)?.full_name ||
                    t('schedule.filterByTeacher')
                  : t('schedule.allTeachers')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('schedule.allTeachers')}</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLessonId} onValueChange={(v) => setFilterLessonId(v ?? '')}>
            <SelectTrigger className="h-8 text-xs min-w-[180px] max-w-[260px]">
              <SelectValue>
                {filterLessonId
                  ? (() => {
                      const lesson = lessons.find((l) => l.id === filterLessonId)
                      if (!lesson) return t('schedule.allLessons')
                      return lesson.course_title
                        ? `${lesson.course_title} / ${lesson.title}`
                        : lesson.title
                    })()
                  : t('schedule.allLessons')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('schedule.allLessons')}</SelectItem>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id}>
                  {lesson.course_title ? `${lesson.course_title} / ` : ''}
                  {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canCreate && currentWeekSessions.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleCopyWeek} disabled={isCopying}>
              <CopyIcon size={14} className="mr-1" />
              {isCopying ? t('common.loading') : t('schedule.copyWeek')}
            </Button>
          )}
          {canCreate && (
            <Button
              size="sm"
              onClick={() => setCreateAt({ date: toISODateString(anchorDate), hour: 9 })}
            >
              <Plus size={16} className="mr-1" />
              {t('schedule.createSession')}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div
            className="grid border-b sticky top-0 bg-background z-10"
            style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
          >
            <div className="border-r" />
            {weekDates.map((d) => {
              const isToday = toISODateString(d) === today
              return (
                <div
                  key={d.toISOString()}
                  className={`px-2 py-2 text-center text-xs font-medium border-r last:border-r-0 ${isToday ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                >
                  {formatDayHeader(d, locale)}
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          <div className="relative" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b"
                style={{ gridTemplateColumns: '52px repeat(7, 1fr)', height: `${CELL_H}px` }}
              >
                <div className="border-r flex items-start justify-end pr-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
                {weekDates.map((d) => {
                  const dayStr = toISODateString(d)
                  const daySessions = (sessionsByDay[dayStr] || []).filter((s) => {
                    const h = new Date(s.scheduled_at).getHours()
                    return h === hour
                  })

                  return (
                    <div
                      key={d.toISOString()}
                      className="border-r last:border-r-0 p-0.5 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => canCreate && setCreateAt({ date: dayStr, hour })}
                    >
                      <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {daySessions.map((s) => (
                          <SessionCard
                            key={s.id}
                            session={s}
                            compact
                            onClick={() => setSelectedSession(s)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create dialog */}
      {createAt && canCreate && (
        <CreateSessionDialog
          defaultDate={createAt.date}
          defaultHour={createAt.hour}
          teachers={teachers}
          lessons={lessons}
          currentProfileId={currentProfileId}
          onClose={() => setCreateAt(null)}
        />
      )}

      {/* Edit dialog */}
      {selectedSession && (
        <CreateSessionDialog
          session={selectedSession}
          teachers={teachers}
          lessons={lessons}
          currentProfileId={currentProfileId}
          onClose={() => setSelectedSession(null)}
          onDuplicated={goToNextWeek}
        />
      )}
    </div>
  )
}
