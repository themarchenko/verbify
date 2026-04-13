'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { type Locale, locales } from '@/i18n/config'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import { setUserLocale } from '@/lib/locale'

const localeLabels: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
}

export default function LanguagePage() {
  const t = useTranslations('profile')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const newLocale = value as Locale
    if (newLocale === locale || isPending) return
    startTransition(async () => {
      await setUserLocale(newLocale)
    })
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-2">
            <Label>{t('language')}</Label>
            <p className="text-sm text-muted-foreground">{t('languageDesc')}</p>
          </div>
          <Select value={locale} onValueChange={(v) => v && handleChange(v)}>
            <SelectTrigger className="w-64" disabled={isPending}>
              <span className="flex flex-1 text-left">{localeLabels[locale as Locale]}</span>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {locales.map((l) => (
                <SelectItem key={l} value={l}>
                  {localeLabels[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
