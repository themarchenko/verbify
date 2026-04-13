'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { BookOpen, Clock, GraduationCap, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { EnrolledCourse } from '../types'

interface CourseListStudentProps {
  courses: EnrolledCourse[]
}

function isExpired(expiresAt: string | null): boolean {
  return !!expiresAt && new Date(expiresAt) < new Date()
}

function ProgressBar({
  completed,
  total,
  t,
}: {
  completed: number
  total: number
  t: ReturnType<typeof useTranslations<'learn'>>
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('lessonsProgress', { completed, total })}</span>
        <span className="tabular-nums font-medium">{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function CourseCard({
  course,
  expired,
  t,
}: {
  course: EnrolledCourse
  expired: boolean
  t: ReturnType<typeof useTranslations<'learn'>>
}) {
  return (
    <Card className={expired ? 'opacity-50 cursor-default' : 'cursor-pointer card-interactive'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg truncate">{course.title}</CardTitle>
          {expired && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Clock size={12} />
              {t('accessExpired')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen size={14} />
          <span>{t('lessonsCount', { count: course.lesson_count })}</span>
          {course.average_score !== null && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <Target size={14} />
              <span>{t('avgScoreLabel', { score: course.average_score })}</span>
            </>
          )}
        </div>
        {course.lesson_count > 0 && (
          <ProgressBar completed={course.completed_count} total={course.lesson_count} t={t} />
        )}
      </CardContent>
    </Card>
  )
}

export function CourseListStudent({ courses }: CourseListStudentProps) {
  const t = useTranslations('learn')

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted animate-pulse">
            <GraduationCap size={36} className="text-muted-foreground" />
          </div>
          <div className="absolute -right-2 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <BookOpen size={14} className="text-muted-foreground" />
          </div>
        </div>
        <p className="text-xl font-semibold">{t('noCourses')}</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t('noCoursesHint')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => {
        const expired = isExpired(course.expires_at)

        if (expired) {
          return (
            <div key={course.id}>
              <CourseCard course={course} expired={expired} t={t} />
            </div>
          )
        }

        return (
          <Link key={course.id} href={`/learn/${course.id}`}>
            <CourseCard course={course} expired={expired} t={t} />
          </Link>
        )
      })}
    </div>
  )
}
