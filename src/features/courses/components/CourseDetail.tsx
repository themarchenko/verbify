'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useId, useState } from 'react'

import { createHomework } from '@/features/homework/api/homework.mutations'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Copy,
  GripVertical,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SaveStatus, useSaveStatus } from '@/components/ui/save-status'

import { cn } from '@/lib/utils'

import {
  createLesson,
  deleteLesson,
  duplicateLesson,
  reorderLessons,
  updateCourse,
} from '../api/courses.mutations'
import { ManageStudentsDialog } from './ManageStudentsDialog'

interface Lesson {
  id: string
  title: string
  order_index: number
  is_published: boolean | null
  lesson_type: string
  due_date?: string | null
}

interface CourseDetailProps {
  course: {
    id: string
    title: string
    description: string | null
    is_published: boolean | null
  }
  lessons: Lesson[]
}

function SortableLesson({
  lesson,
  index,
  courseId,
  onDelete,
  onDuplicate,
}: {
  lesson: Lesson
  index: number
  courseId: string
  onDelete: (id: string) => void
  onDuplicate: (id: string, title: string) => void
}) {
  const t = useTranslations()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 -m-1 text-muted-foreground/30 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <span className="text-sm font-medium text-muted-foreground w-6 text-right tabular-nums">
        {index + 1}.
      </span>
      <Link
        href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
        className="flex items-center flex-1 min-w-0 gap-3"
      >
        {lesson.lesson_type === 'homework' && (
          <ClipboardCheck size={16} className="text-muted-foreground shrink-0" />
        )}
        <span className="text-base font-medium truncate flex-1">{lesson.title}</span>
        {lesson.lesson_type === 'homework' && (
          <Badge variant="outline" className="text-xs shrink-0 border-amber-300 text-amber-600">
            {t('homework.title')}
          </Badge>
        )}
        <Badge variant={lesson.is_published ? 'outline' : 'secondary'} className="text-xs shrink-0">
          {lesson.is_published ? t('courses.live') : t('courses.draft')}
        </Badge>
        <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
      </Link>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground/30 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => onDuplicate(lesson.id, lesson.title)}
      >
        <Copy size={15} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => onDelete(lesson.id)}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  )
}

export function CourseDetail({ course, lessons: initialLessons }: CourseDetailProps) {
  const t = useTranslations()
  const dndId = useId()
  const [confirm, confirmDialog] = useConfirm()
  const [open, setOpen] = useState(false)
  const [hwOpen, setHwOpen] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState(initialLessons)
  const [dupOpen, setDupOpen] = useState(false)
  const [dupLoading, setDupLoading] = useState(false)
  const [dupSource, setDupSource] = useState<{ id: string; title: string } | null>(null)
  const [dupTitle, setDupTitle] = useState('')
  const [editTitle, setEditTitle] = useState(course.title)
  const [editDescription, setEditDescription] = useState(course.description ?? '')
  const titleSave = useSaveStatus()
  const descSave = useSaveStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(lessons, oldIndex, newIndex)
    setLessons(reordered)
    reorderLessons(
      course.id,
      reordered.map((l) => l.id)
    )
  }

  async function handleCreateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const newLesson = await createLesson(course.id, fd.get('title') as string)
    setLessons((prev) => [...prev, newLesson])
    setOpen(false)
    setLoading(false)
  }

  async function handleCreateHomework(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const newHomework = await createHomework(course.id, fd.get('title') as string)
    setLessons((prev) => [...prev, newHomework])
    setHwOpen(false)
    setLoading(false)
  }

  function handleDuplicateOpen(lessonId: string, title: string) {
    setDupSource({ id: lessonId, title })
    setDupTitle(title)
    setDupOpen(true)
  }

  async function handleDuplicateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!dupSource) return
    setDupLoading(true)
    const newLesson = await duplicateLesson(dupSource.id, course.id, dupTitle)
    setLessons((prev) => [...prev, newLesson])
    setDupOpen(false)
    setDupLoading(false)
  }

  async function handleDeleteLesson(lessonId: string) {
    const ok = await confirm({
      title: t('blocks.deleteBlock'),
      description: t('blocks.deleteBlockConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      variant: 'destructive',
    })
    if (!ok) return
    await deleteLesson(lessonId, course.id)
    setLessons((prev) => prev.filter((l) => l.id !== lessonId))
  }

  async function handleRenameSubmit() {
    const trimmed = editTitle.trim()
    if (!trimmed || trimmed === course.title) {
      setEditTitle(course.title)
      return
    }
    await updateCourse(course.id, { title: trimmed })
    titleSave.markSaved()
  }

  async function handleDescriptionSubmit() {
    const trimmed = editDescription.trim()
    if (trimmed === (course.description ?? '')) {
      return
    }
    await updateCourse(course.id, { description: trimmed || null })
    descSave.markSaved()
  }

  async function handleTogglePublish() {
    await updateCourse(course.id, { is_published: !course.is_published })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="rounded-xl border bg-white p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') {
                    setEditTitle(course.title)
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="text-xl sm:text-2xl font-bold tracking-tight border-0 px-0 focus-visible:ring-0"
              />
              <SaveStatus {...titleSave} />
              <Badge variant={course.is_published ? 'default' : 'secondary'} className="shrink-0">
                {course.is_published ? t('courses.live') : t('courses.draft')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onBlur={handleDescriptionSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') {
                    setEditDescription(course.description ?? '')
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                placeholder={t('courses.courseDescription')}
                className="text-sm text-muted-foreground border-0 rounded-none px-0 focus-visible:ring-0 focus:text-foreground caret-foreground"
              />
              <SaveStatus {...descSave} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{t('courses.lessons', { count: lessons.length })}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setStudentsOpen(true)}>
                <Users size={16} />
                {t('courses.manageStudents')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleTogglePublish}>
                <span
                  className={cn(
                    'size-2 rounded-full',
                    course.is_published ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )}
                />
                {course.is_published ? t('common.unpublish') : t('common.publish')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('lessons.title')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHwOpen(true)}>
              <ClipboardCheck size={16} />
              {t('homework.newHomework')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Plus size={16} />
              {t('lessons.newLesson')}
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('lessons.newLesson')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLesson} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t('lessons.lessonTitle')}</Label>
                  <Input name="title" required autoFocus />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('common.create')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={hwOpen} onOpenChange={setHwOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('homework.newHomework')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateHomework} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t('homework.homeworkTitle')}</Label>
                  <Input name="title" required autoFocus />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('common.create')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={dupOpen} onOpenChange={setDupOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('lessons.duplicateLesson')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDuplicateLesson} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t('lessons.lessonTitle')}</Label>
                  <Input
                    value={dupTitle}
                    onChange={(e) => setDupTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={dupLoading}>
                  {dupLoading ? t('common.loading') : t('courses.duplicate')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center flex flex-col items-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen size={22} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">{t('lessons.noBlocks')}</p>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Plus size={16} />
              {t('lessons.newLesson')}
            </Button>
          </div>
        ) : (
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {lessons.map((lesson, i) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    index={i}
                    courseId={course.id}
                    onDelete={handleDeleteLesson}
                    onDuplicate={handleDuplicateOpen}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <ManageStudentsDialog
        open={studentsOpen}
        onOpenChange={setStudentsOpen}
        courseId={course.id}
      />

      {confirmDialog}
    </div>
  )
}
