'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { createCourse, deleteCourse, duplicateCourse, updateCourse } from '../api/courses.mutations'
import { CourseCard } from './CourseCard'

type StatusFilter = 'all' | 'published' | 'draft'

interface CourseListProps {
  courses: Array<{
    id: string
    title: string
    description: string | null
    is_published: boolean | null
    lesson_count: number
    student_count: number
  }>
}

export function CourseList({ courses }: CourseListProps) {
  const t = useTranslations()
  const [confirm, confirmDialog] = useConfirm()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [duplicateSource, setDuplicateSource] = useState<{
    id: string
    title: string
  } | null>(null)
  const [duplicateTitle, setDuplicateTitle] = useState('')
  const [includeStudents, setIncludeStudents] = useState(false)

  const filtered = useMemo(() => {
    let result = courses
    if (status === 'published') result = result.filter((c) => c.is_published)
    else if (status === 'draft') result = result.filter((c) => !c.is_published)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      )
    }
    return result
  }, [courses, search, status])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createCourse(fd.get('title') as string, fd.get('description') as string)
    setOpen(false)
    setLoading(false)
  }

  function handleDuplicateOpen(id: string, title: string) {
    setDuplicateSource({ id, title })
    setDuplicateTitle(title)
    setIncludeStudents(false)
    setDuplicateOpen(true)
  }

  async function handleDuplicate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!duplicateSource) return
    setDuplicateLoading(true)
    await duplicateCourse(duplicateSource.id, duplicateTitle, includeStudents)
    setDuplicateOpen(false)
    setDuplicateLoading(false)
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    await updateCourse(id, { is_published: !isPublished })
  }

  async function handleDelete(id: string) {
    const course = courses.find((c) => c.id === id)
    const ok = await confirm({
      title: t('courses.deleteCourse'),
      description: t('courses.deleteConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      variant: 'destructive',
      confirmText: course?.title || '',
      confirmTextHint: t('courses.deleteConfirmHint'),
    })
    if (!ok) return
    await deleteCourse(id)
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('courses.filterAll') },
    { value: 'published', label: t('courses.live') },
    { value: 'draft', label: t('courses.draft') },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('courses.title')}</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} className="mr-2" />
          {t('courses.newCourse')}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('courses.newCourse')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('courses.courseTitle')}</Label>
                <Input name="title" required autoFocus />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('courses.courseDescription')}</Label>
                <Textarea name="description" rows={3} />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('common.create')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('courses.duplicateCourse')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDuplicate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('courses.courseTitle')}</Label>
                <Input
                  value={duplicateTitle}
                  onChange={(e) => setDuplicateTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="include-students" className="font-normal">
                  {t('courses.includeStudents')}
                </Label>
                <Switch
                  id="include-students"
                  checked={includeStudents}
                  onCheckedChange={setIncludeStudents}
                />
              </div>
              <Button type="submit" disabled={duplicateLoading}>
                {duplicateLoading ? t('common.loading') : t('courses.duplicate')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 rounded-lg border p-1 h-10 items-center">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                status === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-medium">{t('courses.noCourses')}</p>
          <p className="text-base text-muted-foreground mt-1">{t('courses.noCoursesDesc')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-medium">{t('common.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              isPublished={course.is_published ?? false}
              lessonCount={course.lesson_count}
              studentCount={course.student_count}
              onDelete={handleDelete}
              onDuplicate={handleDuplicateOpen}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}
      {confirmDialog}
    </div>
  )
}
