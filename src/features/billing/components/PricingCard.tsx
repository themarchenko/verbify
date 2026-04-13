'use client'

import { useTranslations } from 'next-intl'

import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface PricingCardProps {
  name: string
  price: number
  period: 'monthly' | 'yearly'
  limits: { students: number; teachers: number }
  isCurrent: boolean
  onSelect?: () => void
}

export function PricingCard({
  name,
  price,
  period,
  limits,
  isCurrent,
  onSelect,
}: PricingCardProps) {
  const t = useTranslations('billing')

  const features = [
    limits.students === Infinity
      ? `${t('unlimited')} ${t('studentsLimit', { count: '' }).trim()}`
      : t('studentsLimit', { count: limits.students }),
    limits.teachers === Infinity
      ? `${t('unlimited')} ${t('teachersLimit', { count: '' }).trim()}`
      : t('teachersLimit', { count: limits.teachers }),
    t('lessonBuilder'),
    t('progressTracking'),
  ]

  return (
    <Card className={cn('relative overflow-visible', isCurrent && 'ring-2 ring-primary')}>
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded-full font-medium z-10">
          {t('currentBadge')}
        </div>
      )}
      <CardHeader className={cn('text-center pb-2', isCurrent && 'pt-8')}>
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="mt-3">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-sm text-muted-foreground ml-1">
            {period === 'monthly' ? t('perMonth') : t('perYear')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ul className="flex flex-col gap-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <Check size={16} className="text-foreground shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          variant={isCurrent ? 'secondary' : 'default'}
          className="w-full"
          disabled={isCurrent}
          onClick={onSelect}
        >
          {isCurrent ? t('currentPlan') : t('select')}
        </Button>
      </CardContent>
    </Card>
  )
}
