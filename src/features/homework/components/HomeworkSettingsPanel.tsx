'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'
import { toDatetimeLocalValue } from '@/shared/lib/date'
import { CalendarDays, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { updateHomeworkMeta } from '../api/homework.mutations'

interface HomeworkSettingsPanelProps {
  lessonId: string
  meta: {
    id: string
    lesson_id: string
    school_id: string
    due_date: string | null
    allow_late_submission: boolean | null
  } | null
}

export function HomeworkSettingsPanel({ lessonId, meta }: HomeworkSettingsPanelProps) {
  const t = useTranslations('homework')

  const [dueDate, setDueDate] = useState(meta?.due_date ? formatDateForInput(meta.due_date) : '')
  const [allowLate, setAllowLate] = useState(meta?.allow_late_submission ?? false)

  const debouncedDueDate = useDebounce(dueDate, 800)

  useEffect(() => {
    const isoDate = debouncedDueDate ? new Date(debouncedDueDate).toISOString() : null
    const currentIso = meta?.due_date ?? null

    if (isoDate !== currentIso) {
      updateHomeworkMeta(lessonId, { due_date: isoDate })
    }
  }, [debouncedDueDate, lessonId, meta?.due_date])

  async function handleAllowLateChange(checked: boolean) {
    setAllowLate(checked)
    await updateHomeworkMeta(lessonId, { allow_late_submission: checked })
  }

  function clearDueDate() {
    setDueDate('')
    updateHomeworkMeta(lessonId, { due_date: null })
  }

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 items-start">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm flex items-center gap-1.5">
          <CalendarDays size={14} />
          {t('dueDate')}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm w-auto"
          />
          {dueDate && (
            <Button variant="ghost" size="icon-sm" onClick={clearDueDate}>
              <X size={14} />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('dueDateDesc')}</p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer pt-6">
        <Switch size="sm" checked={allowLate} onCheckedChange={handleAllowLateChange} />
        <div>
          <p className="text-sm font-medium leading-none">{t('allowLate')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('allowLateDesc')}</p>
        </div>
      </label>
    </div>
  )
}

function formatDateForInput(isoDate: string): string {
  return toDatetimeLocalValue(new Date(isoDate))
}
