'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { formatDateShort } from '@/shared/lib/date'
import { toISODateString } from '@/shared/lib/date'
import { CalendarDays, Infinity as InfinityIcon, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface EnrollmentDatePickerProps {
  value: string
  onChange: (value: string) => void
  onSave: (value: string | null) => Promise<void>
  isExpired?: boolean
}

export function EnrollmentDatePicker({
  value,
  onChange,
  onSave,
  isExpired,
}: EnrollmentDatePickerProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined

  async function handleSelect(date: Date | undefined) {
    if (!date) return
    const iso = toISODateString(date)
    onChange(iso)
    setSaving(true)
    await onSave(iso)
    setSaving(false)
    setOpen(false)
  }

  async function handleClear() {
    onChange('')
    setSaving(true)
    await onSave(null)
    setSaving(false)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ' +
          (isExpired
            ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20'
            : value
              ? 'border-border bg-background text-foreground hover:bg-muted'
              : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80')
        }
      >
        {saving ? (
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isExpired ? (
          <CalendarDays className="size-3" />
        ) : value ? (
          <CalendarDays className="size-3 text-muted-foreground" />
        ) : (
          <InfinityIcon className="size-3" />
        )}
        {isExpired
          ? t('learn.accessExpired')
          : value
            ? formatDateShort(value, locale)
            : t('students.permanent')}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate}
        />
        {value && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="xs"
              className="w-full text-muted-foreground"
              onClick={handleClear}
            >
              <X className="size-3" />
              {t('students.permanent')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
