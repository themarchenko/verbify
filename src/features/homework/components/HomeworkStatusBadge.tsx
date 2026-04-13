'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'

import type { HomeworkStatus } from '../types'

const statusVariants: Record<HomeworkStatus, 'default' | 'secondary' | 'outline' | 'destructive'> =
  {
    not_started: 'outline',
    in_progress: 'secondary',
    submitted: 'default',
    graded: 'default',
    overdue: 'destructive',
  }

export function HomeworkStatusBadge({ status }: { status: HomeworkStatus }) {
  const t = useTranslations('homework')

  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>
}
