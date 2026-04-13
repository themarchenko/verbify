'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { Check } from 'lucide-react'

export const SETTINGS_SAVED_EVENT = 'settings-saved'

export function dispatchSaved() {
  window.dispatchEvent(new Event(SETTINGS_SAVED_EVENT))
}

export function SaveIndicator() {
  const tCommon = useTranslations('common')
  const [visible, setVisible] = useState(false)

  const handleSaved = useCallback(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    window.addEventListener(SETTINGS_SAVED_EVENT, handleSaved)
    return () => window.removeEventListener(SETTINGS_SAVED_EVENT, handleSaved)
  }, [handleSaved])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground ring-1 ring-border shadow-sm transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: 'none',
      }}
    >
      <Check className="size-3.5" />
      {tCommon('saved')}
    </div>
  )
}
