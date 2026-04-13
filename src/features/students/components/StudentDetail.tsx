'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

import { removeEnrollment, updateEnrollmentExpiration } from '@/features/enrollments'
import { EnrollmentDatePicker } from '@/features/enrollments/components/EnrollmentDatePicker'
import { formatDateMedium } from '@/shared/lib/date'
import { ArrowLeft, BookOpen, Mail, Pencil, Plus, Target, TrendingUp, X, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useEditStudentDialog } from '../hooks/useEditStudentDialog'
import { EnrollStudentInCourseDialog } from './EnrollStudentInCourseDialog'

interface CourseAnalytics {
  enrollmentId: string
  courseId: string
  courseTitle: string
  isPublished: boolean
  enrolledAt: string | null
  expiresAt: string | null
  totalLessons: number
  totalBlocks: number
  completedBlocks: number
  progressPercent: number
  avgScore: number | null
}

interface AvailableCourse {
  id: string
  title: string
}

interface StudentDetailProps {
  student: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    created_at: string | null
  }
  stats: {
    coursesEnrolled: number
    completedBlocks: number
    totalBlocks: number
    overallProgress: number
    overallAvgScore: number | null
    totalAttempts: number
    lastActivity: string | null
  }
  courses: CourseAnalytics[]
  availableCourses: AvailableCourse[]
}

function formatDate(dateStr: string | null, locale: string) {
  if (!dateStr) return '—'
  return formatDateMedium(dateStr, locale)
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-2 rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  )
}

export function StudentDetail({ student, stats, courses, availableCourses }: StudentDetailProps) {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const { editStudent, editStudentDialog } = useEditStudentDialog()

  const statCards = [
    {
      label: t('coursesEnrolled'),
      value: stats.coursesEnrolled,
      icon: BookOpen,
    },
    {
      label: t('overallProgress'),
      value: `${stats.overallProgress}%`,
      icon: TrendingUp,
    },
    {
      label: t('avgScore'),
      value: stats.overallAvgScore !== null ? `${stats.overallAvgScore}%` : '—',
      icon: Target,
    },
    {
      label: t('totalAttempts'),
      value: stats.totalAttempts,
      icon: Zap,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/students">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0"
          style={{ background: 'var(--surface-3)' }}
        >
          {student.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {student.full_name || t('unnamed')}
            </h1>
            <Button variant="ghost" size="icon-sm" onClick={() => editStudent(student.id)}>
              <Pencil size={14} />
            </Button>
          </div>
          {student.email && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail size={13} />
              {student.email}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('joinedOn', { date: formatDate(student.created_at, locale) })}
            {stats.lastActivity && (
              <>
                {' · '}
                {t('lastActive')}: {formatDate(stats.lastActivity, locale)}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon size={18} className="text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('overallProgress')}</span>
            <span className="text-sm text-muted-foreground">
              {t('blocks', {
                completed: stats.completedBlocks,
                total: stats.totalBlocks,
              })}
            </span>
          </div>
          <ProgressBar percent={stats.overallProgress} />
        </CardContent>
      </Card>

      {/* Course progress list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('courseProgress')}</h2>
          <Button variant="outline" size="sm" onClick={() => setEnrollOpen(true)}>
            <Plus size={16} />
            {t('enrollInCourse')}
          </Button>
        </div>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('noCourses')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.map((course) => (
              <CourseEnrollmentCard key={course.courseId} course={course} onConfirm={confirm} />
            ))}
          </div>
        )}
      </div>

      {editStudentDialog}

      <EnrollStudentInCourseDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        studentId={student.id}
        courses={availableCourses}
      />

      {confirmDialog}
    </div>
  )
}

function CourseEnrollmentCard({
  course,
  onConfirm,
}: {
  course: CourseAnalytics
  onConfirm: (opts: {
    title: string
    description: string
    confirmLabel: string
    cancelLabel: string
    variant: 'destructive'
  }) => Promise<boolean>
}) {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [expiresAt, setExpiresAt] = useState(course.expiresAt ? course.expiresAt.split('T')[0] : '')

  const isExpired = !!(course.expiresAt && new Date(course.expiresAt) < new Date())

  async function handleSaveExpiration(value: string | null) {
    await updateEnrollmentExpiration(course.enrollmentId, value)
  }

  async function handleRemove() {
    const ok = await onConfirm({
      title: t('removeAccess'),
      description: t('removeAccessConfirm', { course: course.courseTitle }),
      confirmLabel: tc('delete'),
      cancelLabel: tc('cancel'),
      variant: 'destructive',
    })
    if (!ok) return
    await removeEnrollment(course.enrollmentId)
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/courses/${course.courseId}`}
                className="text-base font-medium hover:underline truncate"
              >
                {course.courseTitle}
              </Link>
              <Badge
                variant={course.isPublished ? 'outline' : 'secondary'}
                className="text-xs shrink-0"
              >
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
              {course.enrolledAt && ` · ${t('enrolled')} ${formatDate(course.enrolledAt, locale)}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold">{course.progressPercent}%</p>
            {course.avgScore !== null && (
              <p className="text-xs text-muted-foreground">
                {t('score', { score: course.avgScore })}
              </p>
            )}
          </div>
        </div>
        <ProgressBar percent={course.progressPercent} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {t('blocks', {
              completed: course.completedBlocks,
              total: course.totalBlocks,
            })}
          </span>
          {course.progressPercent === 0 && (
            <Badge variant="secondary" className="text-xs">
              {t('notStarted')}
            </Badge>
          )}
        </div>

        {/* Enrollment controls */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <EnrollmentDatePicker
            value={expiresAt}
            onChange={setExpiresAt}
            onSave={handleSaveExpiration}
            isExpired={isExpired}
          />
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
          >
            <X size={14} />
            {t('removeAccess')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
