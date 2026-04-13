'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { formatDateMedium } from '@/shared/lib/date'
import { ArrowLeft, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { computeHomeworkStatus } from '../hooks/useHomeworkStatus'
import type { HomeworkMeta, HomeworkStatus } from '../types'
import { HomeworkStatusBadge } from './HomeworkStatusBadge'

interface Submission {
  id: string
  lesson_id: string
  student_id: string
  status: string
  score: number | null
  submitted_at: string | null
  student: { id: string; full_name: string | null; avatar_url: string | null }
}

interface HomeworkGradingListProps {
  lessonId: string
  courseId: string
  lessonTitle: string
  submissions: Submission[]
  meta: HomeworkMeta | null
}

export function HomeworkGradingList({
  lessonId,
  courseId,
  lessonTitle,
  submissions,
  meta,
}: HomeworkGradingListProps) {
  const t = useTranslations('homework')
  const locale = useLocale()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/courses/${courseId}/lessons/${lessonId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{lessonTitle}</h1>
          <p className="text-sm text-muted-foreground">{t('viewSubmissions')}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">{t('noSubmissions')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {submissions.map((sub) => {
            const status = computeHomeworkStatus(
              {
                ...sub,
                school_id: '',
                feedback: null,
                graded_at: null,
                graded_by: null,
                status: sub.status as 'not_started' | 'in_progress' | 'submitted' | 'graded',
              },
              meta
            )

            return (
              <Link
                key={sub.id}
                href={`/dashboard/courses/${courseId}/lessons/${lessonId}/submissions/${sub.student_id}`}
                className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all"
              >
                <Avatar className="size-8">
                  <AvatarFallback>
                    <User size={14} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1 truncate">
                  {sub.student?.full_name || t('unknownStudent')}
                </span>
                <HomeworkStatusBadge status={status} />
                {sub.score !== null && (
                  <Badge variant="outline" className="text-xs">
                    {sub.score}/100
                  </Badge>
                )}
                {sub.submitted_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDateMedium(sub.submitted_at, locale)}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
