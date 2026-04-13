'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'

import { type Locale, locales } from '@/i18n/config'

import { setUserLocale } from '@/lib/locale'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  function handleChange(newLocale: Locale) {
    if (newLocale === locale || isPending) return
    startTransition(async () => {
      await setUserLocale(newLocale)
    })
  }

  return (
    <div className={cn('flex items-center gap-0.5 select-none', isPending && 'opacity-50')}>
      {locales.map((l) => (
        <div
          key={l}
          role="button"
          tabIndex={0}
          onClick={() => handleChange(l)}
          onKeyDown={(e) => e.key === 'Enter' && handleChange(l)}
          className={cn(
            'px-3 py-1.5 text-sm rounded cursor-pointer transition-colors',
            locale === l
              ? 'bg-foreground text-background font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {l.toUpperCase()}
        </div>
      ))}
    </div>
  )
}
