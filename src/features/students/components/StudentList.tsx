'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { deleteStudent, fetchStudentsPage, updateStudent } from '../api/students.mutations'
import { InviteStudentDialog } from './InviteStudentDialog'

interface Student {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
}

interface Course {
  id: string
  title: string
}

interface StudentListProps {
  initialStudents: Student[]
  initialTotal: number
  initialHasMore: boolean
  courses: Course[]
}

const ALL_COURSES = '__all__'

function CourseFilterDropdown({
  courses,
  value,
  onChange,
}: {
  courses: Course[]
  value: string
  onChange: (value: string) => void
}) {
  const t = useTranslations('students')
  const [open, setOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')

  const filtered = courseSearch
    ? courses.filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
    : courses

  const selectedLabel =
    value === ALL_COURSES
      ? t('allCourses')
      : (courses.find((c) => c.id === value)?.title ?? t('allCourses'))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center justify-between gap-2 rounded-lg border border-input bg-transparent py-2 pr-3 pl-3.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-10 sm:w-72 cursor-pointer">
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="p-2 border-b">
          <Input
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder={t('searchCourses')}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          <button
            type="button"
            className="relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
            onClick={() => {
              onChange(ALL_COURSES)
              setOpen(false)
              setCourseSearch('')
            }}
          >
            {value === ALL_COURSES && <Check className="size-4 shrink-0" />}
            <span className={value !== ALL_COURSES ? 'pl-6' : ''}>{t('allCourses')}</span>
          </button>
          {filtered.map((course) => (
            <button
              key={course.id}
              type="button"
              className="relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => {
                onChange(course.id)
                setOpen(false)
                setCourseSearch('')
              }}
            >
              {value === course.id && <Check className="size-4 shrink-0" />}
              <span className={value !== course.id ? 'pl-6' : ''}>{course.title}</span>
            </button>
          ))}
          {filtered.length === 0 && courseSearch && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('tryDifferentFilters')}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function StudentList({
  initialStudents,
  initialTotal,
  initialHasMore,
  courses,
}: StudentListProps) {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const tAuth = useTranslations('auth')
  const [confirm, confirmDialog] = useConfirm()

  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [total, setTotal] = useState(initialTotal)
  const [hasMore, setHasMore] = useState(initialHasMore)

  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState(ALL_COURSES)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const isFiltered = search !== '' || courseId !== ALL_COURSES

  // Reload list when filters change
  const loadStudents = useCallback((searchVal: string, courseVal: string) => {
    startTransition(async () => {
      const result = await fetchStudentsPage({
        search: searchVal || undefined,
        courseId: courseVal === ALL_COURSES ? undefined : courseVal,
        offset: 0,
      })
      setStudents(result.students)
      setTotal(result.total)
      setHasMore(result.hasMore)
    })
  }, [])

  // Debounced search
  function handleSearchChange(value: string) {
    setSearch(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      loadStudents(value, courseId)
    }, 300)
  }

  function handleCourseChange(value: string) {
    setCourseId(value)
    loadStudents(search, value)
  }

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const result = await fetchStudentsPage({
      search: search || undefined,
      courseId: courseId === ALL_COURSES ? undefined : courseId,
      offset: students.length,
    })
    setStudents((prev) => [...prev, ...result.students])
    setTotal(result.total)
    setHasMore(result.hasMore)
    setLoadingMore(false)
  }, [loadingMore, hasMore, search, courseId, students.length])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isPending) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, isPending, loadMore])

  // Sync with server revalidation (e.g. after invite/delete)
  useEffect(() => {
    setStudents(initialStudents)
    setTotal(initialTotal)
    setHasMore(initialHasMore)
  }, [initialStudents, initialTotal, initialHasMore])

  async function handleDelete(student: Student) {
    const ok = await confirm({
      title: t('deleteStudent'),
      description: t('deleteConfirm', { name: student.full_name || t('unnamed') }),
      confirmLabel: tc('delete'),
      cancelLabel: tc('cancel'),
      variant: 'destructive',
    })
    if (!ok) return
    await deleteStudent(student.id)
    // Reload current view
    loadStudents(search, courseId)
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingStudent) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await updateStudent(editingStudent.id, fd.get('fullName') as string)
    setEditingStudent(null)
    setLoading(false)
    loadStudents(search, courseId)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <InviteStudentDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('searchByName')}
            className="pl-10"
          />
        </div>
        {courses.length > 0 && (
          <CourseFilterDropdown courses={courses} value={courseId} onChange={handleCourseChange} />
        )}
      </div>

      {/* Count */}
      {(students.length > 0 || isFiltered) && (
        <p className="text-sm text-muted-foreground -mt-3">{t('totalCount', { count: total })}</p>
      )}

      {/* List */}
      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-medium">{isFiltered ? tc('noResults') : t('noStudents')}</p>
          <p className="text-base text-muted-foreground mt-1">
            {isFiltered ? t('tryDifferentFilters') : t('noStudentsDesc')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="group flex items-center gap-3 border rounded-xl p-4 bg-white hover:border-foreground/20 hover:shadow-sm transition-all"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                style={{ background: 'var(--surface-3)' }}
              >
                {student.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <Link
                href={`/dashboard/students/${student.id}`}
                className="flex items-center flex-1 min-w-0 gap-3"
              >
                <p className="text-base font-medium truncate flex-1">
                  {student.full_name || t('unnamed')}
                </p>
                <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all cursor-pointer shrink-0">
                  <MoreVertical size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                    <Pencil size={14} className="mr-2 shrink-0" />
                    {t('editStudent')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(student)}
                  >
                    <Trash2 size={14} className="mr-2 shrink-0" />
                    {t('deleteStudent')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editStudent')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">{tAuth('fullName')}</Label>
              <Input
                id="edit-name"
                name="fullName"
                defaultValue={editingStudent?.full_name || ''}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? tc('loading') : tc('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  )
}
