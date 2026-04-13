'use client'

import { useTranslations } from 'next-intl'
import { useOptimistic, useTransition } from 'react'

import { X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { assignTeacherToLesson, removeTeacherFromLesson } from '../api/schedule.mutations'
import type { LessonTeacher } from '../model/schedule.types'

interface Props {
  lessonId: string
  assignedTeachers: LessonTeacher[]
  allTeachers: Array<{ id: string; full_name: string | null; avatar_url: string | null }>
}

export function TeacherAssignPanel({ lessonId, assignedTeachers, allTeachers }: Props) {
  const t = useTranslations()
  const [, startTransition] = useTransition()
  const [optimisticTeachers, setOptimisticTeachers] = useOptimistic(assignedTeachers)

  const assignedIds = new Set(optimisticTeachers.map((lt) => lt.teacher_id))
  const unassigned = allTeachers.filter((t) => !assignedIds.has(t.id))

  function handleAdd(teacherId: string) {
    const teacher = allTeachers.find((t) => t.id === teacherId)
    if (!teacher) return

    const optimisticEntry: LessonTeacher = {
      id: `tmp-${teacherId}`,
      lesson_id: lessonId,
      teacher_id: teacherId,
      school_id: '',
      created_at: null,
      teacher,
    }

    startTransition(async () => {
      setOptimisticTeachers((prev) => [...prev, optimisticEntry])
      await assignTeacherToLesson(lessonId, teacherId)
    })
  }

  function handleRemove(teacherId: string) {
    startTransition(async () => {
      setOptimisticTeachers((prev) => prev.filter((lt) => lt.teacher_id !== teacherId))
      await removeTeacherFromLesson(lessonId, teacherId)
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('schedule.assignedTeachers')}</p>

      {optimisticTeachers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {optimisticTeachers.map((lt) => (
            <div
              key={lt.teacher_id}
              className="flex items-center gap-1.5 rounded-full border bg-muted px-2 py-1 text-sm"
            >
              <Avatar className="size-5">
                {lt.teacher.avatar_url && (
                  <AvatarImage src={lt.teacher.avatar_url} alt={lt.teacher.full_name || ''} />
                )}
                <AvatarFallback className="text-[10px]">
                  {lt.teacher.full_name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{lt.teacher.full_name || t('staff.unnamed')}</span>
              <button
                onClick={() => handleRemove(lt.teacher_id)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                aria-label={t('schedule.removeTeacher')}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {unassigned.length > 0 && (
        <Select onValueChange={(v) => v && handleAdd(v)} value="">
          <SelectTrigger className="h-8 text-sm w-48">
            <SelectValue placeholder={t('schedule.addTeacher')} />
          </SelectTrigger>
          <SelectContent>
            {unassigned.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.full_name || t('staff.unnamed')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {optimisticTeachers.length === 0 && unassigned.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('schedule.noTeachersInSchool')}</p>
      )}
    </div>
  )
}
