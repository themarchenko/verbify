'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { enrollStudentInCourses } from '@/features/enrollments'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Course {
  id: string
  title: string
}

interface EnrollStudentInCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  courses: Course[]
}

export function EnrollStudentInCourseDialog({
  open,
  onOpenChange,
  studentId,
  courses,
}: EnrollStudentInCourseDialogProps) {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))

  function toggleCourse(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSubmit() {
    if (selected.size === 0) return
    setLoading(true)
    await enrollStudentInCourses(studentId, Array.from(selected), expiresAt || null)
    setSelected(new Set())
    setExpiresAt('')
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('enrollInCourse')}</DialogTitle>
        </DialogHeader>

        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t('noAvailableCourses')}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-2 block">{t('selectCourses')}</Label>
              <div className="rounded-lg border overflow-hidden">
                <div className="sticky top-0 border-b bg-white p-2">
                  <Input
                    placeholder={tc('search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      {tc('noResults')}
                    </p>
                  ) : (
                    filtered.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="accent-foreground"
                        />
                        <span className="text-sm">{course.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('expirationDate')}</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('expirationOptional')}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          {courses.length > 0 && (
            <Button onClick={handleSubmit} disabled={loading || selected.size === 0}>
              {loading ? tc('loading') : t('enrollInCourse')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
