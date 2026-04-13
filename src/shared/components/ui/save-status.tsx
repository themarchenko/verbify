'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { formatTime24 } from '@/shared/lib/date'

interface SaveStatusProps {
  saving?: boolean
  error?: boolean
  savedAt?: Date | null
}

export function SaveStatus({ saving, error, savedAt }: SaveStatusProps) {
  const t = useTranslations()
  const locale = useLocale()

  if (saving) {
    return <span className="text-xs text-muted-foreground">{t('common.saving')}</span>
  }

  if (error) {
    return <span className="text-xs text-destructive">{t('common.saveFailed')}</span>
  }

  if (savedAt) {
    return (
      <span className="text-xs text-muted-foreground animate-in fade-in">
        {t('common.saved')} {formatTime24(savedAt, locale)}
      </span>
    )
  }

  return null
}

export function useSaveStatus() {
  const [status, setStatus] = useState<{
    saving: boolean
    error: boolean
    savedAt: Date | null
  }>({ saving: false, error: false, savedAt: null })

  const timeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  function markSaved() {
    setStatus({ saving: false, error: false, savedAt: new Date() })
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setStatus((prev) => ({ ...prev, savedAt: null }))
    }, 3000)
  }

  function markSaving() {
    setStatus({ saving: true, error: false, savedAt: null })
  }

  function markError() {
    setStatus({ saving: false, error: true, savedAt: null })
  }

  return { ...status, markSaved, markSaving, markError }
}
