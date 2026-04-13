'use client'

import { useTranslations } from 'next-intl'

import { CheckCircle2, Flame, Target, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import type { StudentStats } from '../types'

interface StudentStatsCardsProps {
  stats: StudentStats
}

export function StudentStatsCards({ stats }: StudentStatsCardsProps) {
  const t = useTranslations('learn')

  const items = [
    {
      icon: TrendingUp,
      label: t('overallProgress'),
      value: `${stats.overall_progress_percent}%`,
    },
    {
      icon: Target,
      label: t('averageScore'),
      value: stats.average_score !== null ? `${stats.average_score}%` : t('noScoreYet'),
    },
    {
      icon: CheckCircle2,
      label: t('completedLessons'),
      value: String(stats.completed_lessons_count),
    },
    {
      icon: Flame,
      label: t('studyStreak'),
      value: t('days', { count: stats.study_streak_days }),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <item.icon size={18} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{item.label}</p>
              <p className="text-lg font-semibold tracking-tight">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
