'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { ArrowRight, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { ContinueLearningData } from '../types'

interface ContinueLearningCardProps {
  data: NonNullable<ContinueLearningData>
}

export function ContinueLearningCard({ data }: ContinueLearningCardProps) {
  const t = useTranslations('learn')

  const title = data.has_prior_activity ? t('continueLearning') : t('startLearning')
  const description = data.has_prior_activity ? t('continueDesc') : t('startDesc')

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
          <Play size={18} className="text-primary-foreground ml-0.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{data.course_title}</p>
          <p className="font-medium truncate">{data.lesson_title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          render={<Link href={`/learn/${data.course_id}/${data.lesson_id}`} />}
        >
          {title}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}
