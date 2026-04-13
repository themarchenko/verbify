'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { toDatetimeLocalValue } from '@/shared/lib/date'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import {
  countRelatedSessions,
  createSession,
  createSessionsBulk,
  deleteRelatedSessions,
  deleteSession,
  removeReminder,
  setReminder,
  updateSession,
} from '../api/schedule.mutations'
import type { ClassSessionWithRelations } from '../model/schedule.types'

interface Props {
  session?: ClassSessionWithRelations | null
  defaultDate?: string
  defaultHour?: number
  teachers: Array<{ id: string; full_name: string | null }>
  lessons: Array<{ id: string; title: string; course_title: string | null }>
  currentProfileId: string
  onClose: () => void
  onDuplicated?: () => void
}

const REMINDER_OPTIONS = [
  { value: '0', label: 'schedule.noReminder' },
  { value: '10', label: 'schedule.reminder10' },
  { value: '30', label: 'schedule.reminder30' },
  { value: '60', label: 'schedule.reminder60' },
  { value: '1440', label: 'schedule.reminder1440' },
]

const DURATION_OPTIONS = [
  { value: '30', label: 'schedule.duration30' },
  { value: '45', label: 'schedule.duration45' },
  { value: '60', label: 'schedule.duration60' },
  { value: '90', label: 'schedule.duration90' },
  { value: '120', label: 'schedule.duration120' },
]

const WEEKDAYS = [
  { key: 1, label: 'schedule.mon' },
  { key: 2, label: 'schedule.tue' },
  { key: 3, label: 'schedule.wed' },
  { key: 4, label: 'schedule.thu' },
  { key: 5, label: 'schedule.fri' },
  { key: 6, label: 'schedule.sat' },
  { key: 0, label: 'schedule.sun' },
]

export function CreateSessionDialog({
  session,
  defaultDate,
  defaultHour,
  teachers,
  lessons,
  currentProfileId,
  onClose,
  onDuplicated,
}: Props) {
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const isEdit = !!session

  const getDefaultDatetime = useCallback(() => {
    if (session) {
      return toDatetimeLocalValue(new Date(session.scheduled_at))
    }
    if (defaultDate) {
      const hour = defaultHour ?? 9
      return `${defaultDate}T${String(hour).padStart(2, '0')}:00`
    }
    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0)
    return toDatetimeLocalValue(now)
  }, [session, defaultDate, defaultHour])

  const [title, setTitle] = useState(session?.title ?? '')
  const [teacherId, setTeacherId] = useState(session?.teacher_id ?? teachers[0]?.id ?? '')
  const [lessonId, setLessonId] = useState(session?.lesson_id ?? '')
  const [datetime, setDatetime] = useState(getDefaultDatetime)
  const [duration, setDuration] = useState(String(session?.duration_minutes ?? 60))
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [reminderMinutes, setReminderMinutes] = useState(
    session?.reminder ? String(session.reminder.remind_minutes_before) : '0'
  )
  const [repeatEnabled, setRepeatEnabled] = useState(false)
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [repeatWeeks, setRepeatWeeks] = useState(4)

  useEffect(() => {
    setDatetime(getDefaultDatetime())
  }, [getDefaultDatetime])

  function toggleRepeatDay(day: number) {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  function getRepeatDates(): Date[] {
    if (!repeatEnabled || repeatDays.length === 0) return []
    const base = new Date(datetime)
    const hour = base.getHours()
    const minute = base.getMinutes()
    const dates: Date[] = []

    const start = new Date(base)
    start.setHours(0, 0, 0, 0)

    for (let week = 0; week < repeatWeeks; week++) {
      for (const dayOfWeek of repeatDays) {
        const d = new Date(start)
        const currentDay = d.getDay()
        const diff = (dayOfWeek - currentDay + 7) % 7
        d.setDate(d.getDate() + diff + week * 7)
        d.setHours(hour, minute, 0, 0)
        if (d >= base && !(isEdit && d.getTime() === base.getTime())) {
          dates.push(d)
        }
      }
    }

    dates.sort((a, b) => a.getTime() - b.getTime())
    return dates
  }

  const repeatDates = repeatEnabled ? getRepeatDates() : []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !teacherId || !datetime) return

    const scheduledAt = new Date(datetime).toISOString()

    const sessionData = {
      title: title.trim(),
      teacher_id: teacherId,
      lesson_id: lessonId || null,
      duration_minutes: Number(duration),
      notes: notes.trim() || null,
    }

    startTransition(async () => {
      if (isEdit) {
        await updateSession(session!.id, {
          ...sessionData,
          scheduled_at: scheduledAt,
        })

        const minutes = Number(reminderMinutes)
        if (session?.reminder) {
          if (minutes === 0) {
            await removeReminder(session!.id)
          } else {
            await setReminder(session!.id, minutes, scheduledAt)
          }
        }

        if (repeatEnabled && repeatDates.length > 0) {
          const bulk = repeatDates.map((d) => ({
            ...sessionData,
            scheduled_at: d.toISOString(),
          }))
          await createSessionsBulk(bulk)
        }
      } else if (repeatEnabled && repeatDates.length > 0) {
        const bulk = repeatDates.map((d) => ({
          ...sessionData,
          scheduled_at: d.toISOString(),
        }))
        await createSessionsBulk(bulk)
      } else {
        await createSession({
          ...sessionData,
          scheduled_at: scheduledAt,
        })
      }

      onClose()
    })
  }

  const [deleteConfirm, setDeleteConfirm] = useState<{
    relatedCount: number
  } | null>(null)

  function handleDelete() {
    if (!session) return
    startDeleting(async () => {
      const count = await countRelatedSessions(session.id)
      if (count > 0) {
        setDeleteConfirm({ relatedCount: count })
      } else {
        await deleteSession(session.id)
        onClose()
      }
    })
  }

  function handleDeleteThis() {
    if (!session) return
    startDeleting(async () => {
      await deleteSession(session.id)
      onClose()
    })
  }

  function handleDeleteAll() {
    if (!session) return
    startDeleting(async () => {
      await deleteRelatedSessions(session.id)
      onClose()
    })
  }

  function handleDuplicate() {
    if (!session) return
    startTransition(async () => {
      const nextWeek = new Date(session.scheduled_at)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const payload = {
        title: session.title,
        teacher_id: session.teacher_id,
        lesson_id: session.lesson_id,
        duration_minutes: session.duration_minutes,
        notes: session.notes,
        scheduled_at: nextWeek.toISOString(),
      }
      console.log('[duplicate] payload', payload)
      try {
        const result = await createSession(payload)
        console.log('[duplicate] created', result)
        onDuplicated?.()
        onClose()
      } catch (err) {
        console.error('[duplicate] error', err)
      }
    })
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="border-b px-5 py-3">
          <SheetTitle>
            {isEdit ? t('schedule.editSession') : t('schedule.createSession')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
            <div className="flex-1 space-y-3 px-5 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="session-title">{t('schedule.sessionTitle')}</Label>
                <Input
                  id="session-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('schedule.sessionTitlePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t('schedule.teacher')}</Label>
                <Select value={teacherId} onValueChange={(v) => setTeacherId(v ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('schedule.selectTeacher')}>
                      {teachers.find((tc) => tc.id === teacherId)?.full_name ||
                        t('schedule.selectTeacher')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name || t('staff.unnamed')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t('schedule.linkedLesson')}</Label>
                <Select value={lessonId} onValueChange={(v) => setLessonId(v ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('schedule.noLesson')}>
                      {lessonId
                        ? (() => {
                            const lesson = lessons.find((l) => l.id === lessonId)
                            if (!lesson) return t('schedule.noLesson')
                            return lesson.course_title
                              ? `${lesson.course_title} / ${lesson.title}`
                              : lesson.title
                          })()
                        : t('schedule.noLesson')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('schedule.noLesson')}</SelectItem>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.course_title ? `${lesson.course_title} / ` : ''}
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="session-datetime">{t('schedule.dateTime')}</Label>
                  <Input
                    id="session-datetime"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('schedule.duration')}</Label>
                  <Select value={duration} onValueChange={(v) => setDuration(v ?? '60')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.label as Parameters<typeof t>[0])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t('schedule.setReminder')}</Label>
                <Select value={reminderMinutes} onValueChange={(v) => setReminderMinutes(v ?? '0')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.label as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="repeat-toggle"
                    checked={repeatEnabled}
                    onChange={(e) => setRepeatEnabled(e.target.checked)}
                    className="size-4 rounded border-input accent-foreground"
                  />
                  <Label htmlFor="repeat-toggle">{t('schedule.repeat')}</Label>
                </div>

                {repeatEnabled && (
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleRepeatDay(key)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            repeatDays.includes(key)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {t(label as Parameters<typeof t>[0])}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">
                        {t('schedule.repeatWeeks')}
                      </Label>
                      <Select
                        value={String(repeatWeeks)}
                        onValueChange={(v) => setRepeatWeeks(Number(v))}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {t('schedule.weekShort')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {repeatDates.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t('schedule.sessionsWillBeCreated', { count: repeatDates.length })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="session-notes">{t('schedule.notes')}</Label>
                <Textarea
                  id="session-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('schedule.notesPlaceholder')}
                  rows={2}
                  className="resize-y"
                />
              </div>
            </div>

            <div className="border-t px-5 py-4 pb-6">
              {deleteConfirm ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                  <p className="text-sm font-medium">{t('schedule.deleteConfirmTitle')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('schedule.deleteConfirmDesc', { count: deleteConfirm.relatedCount })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteThis}
                      disabled={isDeleting}
                    >
                      {t('schedule.deleteThis')}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAll}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? t('common.loading')
                        : t('schedule.deleteAll', {
                            count: deleteConfirm.relatedCount + 1,
                          })}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {isEdit ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting || isPending}
                      >
                        {isDeleting ? t('common.loading') : t('common.delete')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicate}
                        disabled={isPending || isDeleting}
                      >
                        {isPending ? t('common.saving') : t('schedule.duplicate')}
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={isPending || !title.trim()}>
                      {isPending
                        ? t('common.saving')
                        : isEdit
                          ? t('common.save')
                          : t('common.create')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
