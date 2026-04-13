'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { removeEnrollment, updateEnrollmentExpiration } from '@/features/enrollments'
import { formatDateMedium } from '@/shared/lib/date'
import { Loader2, Search, UserPlus, Users, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { fetchCourseStudentsData } from '../api/courses.actions'
import { EnrollStudentsDialog } from './EnrollStudentsDialog'

interface Enrollment {
  id: string
  studentId: string
  studentName: string | null
  enrolledAt: string | null
  expiresAt: string | null
}

interface UnenrolledStudent {
  id: string
  full_name: string | null
}

interface ManageStudentsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export function ManageStudentsDialog({ open, onOpenChange, courseId }: ManageStudentsPanelProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [confirm, confirmDialog] = useConfirm()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [unenrolledStudents, setUnenrolledStudents] = useState<UnenrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await fetchCourseStudentsData(courseId)
    setEnrollments(data.enrollments)
    setUnenrolledStudents(data.unenrolledStudents)
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    if (open) {
      loadData()
      setSearch('')
    }
  }, [open, loadData])

  const filtered = useMemo(() => {
    if (!search.trim()) return enrollments
    const q = search.toLowerCase()
    return enrollments.filter((e) => (e.studentName || '').toLowerCase().includes(q))
  }, [enrollments, search])

  async function handleRemove(enrollment: Enrollment) {
    const ok = await confirm({
      title: t('courses.removeAccess'),
      description: t('courses.removeAccessConfirm', {
        name: enrollment.studentName || '—',
      }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      variant: 'destructive',
    })
    if (!ok) return
    await removeEnrollment(enrollment.id)
    await loadData()
  }

  function handleEnrollClose(isOpen: boolean) {
    setEnrollOpen(isOpen)
    if (!isOpen) {
      loadData()
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users size={18} />
              {t('courses.enrolledStudents')}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 flex-1 min-h-0 px-4 pb-4">
            {/* Toolbar: search + add button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder={t('common.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setEnrollOpen(true)}>
                <UserPlus size={14} />
                {t('courses.addStudents')}
              </Button>
            </div>

            {/* Count */}
            <span className="text-xs text-muted-foreground">
              {t('courses.students', { count: enrollments.length })}
              {search.trim() && filtered.length !== enrollments.length && (
                <> &middot; {filtered.length}</>
              )}
            </span>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-1">{t('courses.noEnrolledStudents')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('courses.noEnrolledStudentsDesc')}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1 overflow-y-auto -mx-1 px-1">
                {filtered.map((enrollment) => (
                  <EnrolledStudentRow
                    key={enrollment.id}
                    enrollment={enrollment}
                    onRemove={() => handleRemove(enrollment)}
                    onExpirationUpdated={loadData}
                  />
                ))}
              </div>
            )}
          </div>

          {confirmDialog}
        </SheetContent>
      </Sheet>

      <EnrollStudentsDialog
        open={enrollOpen}
        onOpenChange={handleEnrollClose}
        courseId={courseId}
        students={unenrolledStudents}
      />
    </>
  )
}

function EnrolledStudentRow({
  enrollment,
  onRemove,
  onExpirationUpdated,
}: {
  enrollment: Enrollment
  onRemove: () => void
  onExpirationUpdated: () => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [expiresAt, setExpiresAt] = useState(
    enrollment.expiresAt ? enrollment.expiresAt.split('T')[0] : ''
  )
  const [saving, setSaving] = useState(false)

  const isExpired = enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()
  const isDirty = expiresAt !== (enrollment.expiresAt ? enrollment.expiresAt.split('T')[0] : '')

  async function handleUpdateExpiration() {
    setSaving(true)
    await updateEnrollmentExpiration(enrollment.id, expiresAt || null)
    setSaving(false)
    onExpirationUpdated()
  }

  return (
    <div className="group rounded-lg border bg-white p-3 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ background: 'var(--surface-3)' }}
        >
          {enrollment.studentName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{enrollment.studentName || '—'}</p>
          <p className="text-xs text-muted-foreground">
            {t('students.enrolled')}{' '}
            {enrollment.enrolledAt ? formatDateMedium(enrollment.enrolledAt, locale) : '—'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={onRemove}
        >
          <X size={14} />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-2 pl-11">
        <Input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-36 h-7 text-xs"
        />
        {isDirty && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={handleUpdateExpiration}
            disabled={saving}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        )}
        {!expiresAt && !isDirty && (
          <Badge variant="secondary" className="text-xs">
            {t('courses.permanent')}
          </Badge>
        )}
        {isExpired && expiresAt && !isDirty && (
          <Badge variant="destructive" className="text-xs">
            {t('learn.accessExpired')}
          </Badge>
        )}
      </div>
    </div>
  )
}
