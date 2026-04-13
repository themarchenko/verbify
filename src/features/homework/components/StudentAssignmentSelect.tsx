'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'

import { Check, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

import { assignStudents } from '../api/homework.mutations'

interface Student {
  student_id: string
  profile: { id: string; full_name: string | null; avatar_url: string | null }
}

interface Enrollment {
  studentId: string
  studentName: string | null
}

interface StudentAssignmentSelectProps {
  lessonId: string
  enrolledStudents: Enrollment[]
  initialAssignments: Student[]
}

export function StudentAssignmentSelect({
  lessonId,
  enrolledStudents,
  initialAssignments,
}: StudentAssignmentSelectProps) {
  const t = useTranslations('homework')
  const [isPending, startTransition] = useTransition()
  const [assignAll, setAssignAll] = useState(initialAssignments.length === 0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialAssignments.map((a) => a.student_id))
  )
  const [search, setSearch] = useState('')

  const filtered = enrolledStudents.filter(
    (s) => !search || (s.studentName || '').toLowerCase().includes(search.toLowerCase())
  )

  function toggleStudent(studentId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  // Save assignments when selection changes
  useEffect(() => {
    const ids = assignAll ? [] : Array.from(selectedIds)
    startTransition(() => {
      assignStudents(lessonId, ids)
    })
  }, [assignAll, selectedIds, lessonId])

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm flex items-center gap-1.5">
        <Users size={14} />
        {t('assignStudents')}
      </Label>

      <label className="flex items-center gap-2 cursor-pointer">
        <Switch
          size="sm"
          checked={assignAll}
          onCheckedChange={(checked) => {
            setAssignAll(checked)
            if (checked) setSelectedIds(new Set())
          }}
        />
        <span className="text-sm">{t('assignAll')}</span>
      </label>

      {!assignAll && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('assignSpecific')}
              className="text-sm pl-8"
            />
          </div>

          <div className="max-h-48 overflow-y-auto rounded-lg border">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('noSubmissions')}</p>
            ) : (
              filtered.map((student) => (
                <button
                  key={student.studentId}
                  type="button"
                  onClick={() => toggleStudent(student.studentId)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors',
                    selectedIds.has(student.studentId) && 'bg-muted/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center size-5 rounded border',
                      selectedIds.has(student.studentId)
                        ? 'bg-foreground border-foreground text-background'
                        : 'border-border'
                    )}
                  >
                    {selectedIds.has(student.studentId) && <Check size={12} />}
                  </div>
                  <span>{student.studentName || t('allStudents')}</span>
                </button>
              ))
            )}
          </div>

          {selectedIds.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('selectedStudents', { count: selectedIds.size })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
