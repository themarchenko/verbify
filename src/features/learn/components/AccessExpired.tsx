'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function AccessExpired() {
  const t = useTranslations('learn')

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'var(--surface-3)' }}
      >
        <Clock size={28} className="text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{t('accessExpired')}</h1>
      <p className="text-base text-muted-foreground max-w-md mb-8">{t('accessExpiredDesc')}</p>
      <Button variant="outline" render={<Link href="/learn" />}>
        {t('backToCourses')}
      </Button>
    </div>
  )
}
