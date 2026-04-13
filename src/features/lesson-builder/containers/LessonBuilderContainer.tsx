'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { HomeworkSettingsPanel } from '@/features/homework/components/HomeworkSettingsPanel'
import { StudentAssignmentSelect } from '@/features/homework/components/StudentAssignmentSelect'
import { TeacherAssignPanel } from '@/features/schedule'
import type { LessonTeacher } from '@/features/schedule/model/schedule.types'
import { useDebounce } from '@/hooks/useDebounce'
import { ArrowLeft, ClipboardCheck, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SaveStatus } from '@/components/ui/save-status'
import { Switch } from '@/components/ui/switch'

import {
  saveBlocks,
  toggleLessonPublish,
  updateLessonSettings,
  updateLessonTitle,
} from '../api/builder.mutations'
import { AddBlockDivider } from '../components/AddBlockDivider'
import { BlockEditor } from '../components/BlockEditor'
import { BlockPicker } from '../components/BlockPicker'
import { BlockWrapper } from '../components/BlockWrapper'
import { useBuilderStore } from '../model/builder.store'
import type { Block, BlockType } from '../types'

interface HomeworkMetaData {
  id: string
  lesson_id: string
  school_id: string
  due_date: string | null
  allow_late_submission: boolean | null
}

interface LessonBuilderContainerProps {
  lesson: {
    id: string
    title: string
    course_id: string | null
    school_id: string | null
    is_published: boolean | null
    sequential_blocks: boolean | null
    require_previous_completion: boolean | null
    lesson_type: string
  }
  initialBlocks: Block[]
  courseTitle: string
  homeworkMeta?: HomeworkMetaData | null
  homeworkAssignments?: Array<{
    student_id: string
    profile: { id: string; full_name: string | null; avatar_url: string | null }
  }>
  enrolledStudents?: Array<{ studentId: string; studentName: string | null }>
  courseId?: string
  lessonTeachers?: LessonTeacher[]
  allTeachers?: Array<{ id: string; full_name: string | null; avatar_url: string | null }>
}

export function LessonBuilderClient({
  lesson,
  initialBlocks,
  courseTitle,
  homeworkMeta,
  homeworkAssignments,
  enrolledStudents,
  courseId,
  lessonTeachers,
  allTeachers,
}: LessonBuilderContainerProps) {
  const isHomework = lesson.lesson_type === 'homework'
  const t = useTranslations()
  const [title, setTitle] = useState(lesson.title)
  const [isPublished, setIsPublished] = useState(lesson.is_published ?? false)
  const [sequentialBlocks, setSequentialBlocks] = useState(lesson.sequential_blocks ?? true)
  const [requirePrevious, setRequirePrevious] = useState(lesson.require_previous_completion ?? true)

  const {
    blocks,
    version,
    savedVersion,
    saving,
    lastSaved,
    saveError,
    activeBlockId,
    setBlocks,
    addBlock,
    updateBlockContent,
    removeBlock,
    setActiveBlock,
    setSaving,
    setSaved,
    setSaveError,
  } = useBuilderStore()

  const debouncedVersion = useDebounce(version, 500)
  const debouncedTitle = useDebounce(title, 500)
  const initialized = useRef(false)

  useEffect(() => {
    setBlocks(initialBlocks as Block[])
    initialized.current = true
  }, [initialBlocks, setBlocks])

  // Autosave blocks when debounced version exceeds saved version
  useEffect(() => {
    if (!initialized.current) return
    if (debouncedVersion <= savedVersion) return

    let cancelled = false

    async function save() {
      setSaving(true)
      try {
        // Read blocks from store at save time
        const currentBlocks = useBuilderStore.getState().blocks
        await saveBlocks(lesson.id, currentBlocks)
        if (!cancelled) setSaved()
      } catch {
        if (!cancelled) setSaveError()
      }
    }
    save()

    return () => {
      cancelled = true
    }
  }, [debouncedVersion, savedVersion, lesson.id, setSaving, setSaved, setSaveError])

  // Autosave title
  useEffect(() => {
    if (!initialized.current || debouncedTitle === lesson.title) return
    updateLessonTitle(lesson.id, debouncedTitle)
  }, [debouncedTitle, lesson.id, lesson.title])

  const handleAddBlock = useCallback(
    (type: BlockType, afterIndex: number) => {
      addBlock(type, afterIndex, lesson.id, lesson.school_id!)
    },
    [addBlock, lesson.id, lesson.school_id]
  )

  async function handleTogglePublish() {
    const newState = !isPublished
    setIsPublished(newState)
    await toggleLessonPublish(lesson.id, newState)
  }

  async function handleToggleSequential(checked: boolean) {
    setSequentialBlocks(checked)
    await updateLessonSettings(lesson.id, { sequential_blocks: checked })
  }

  async function handleToggleRequirePrevious(checked: boolean) {
    setRequirePrevious(checked)
    await updateLessonSettings(lesson.id, { require_previous_completion: checked })
  }

  const isDirty = version > savedVersion

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/courses/${lesson.course_id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <span className="text-base text-muted-foreground hidden sm:inline">{courseTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <SaveStatus saving={saving} error={saveError} savedAt={!isDirty ? lastSaved : null} />
          {isHomework && (
            <Badge variant="outline" className="border-amber-300 text-amber-600">
              <ClipboardCheck size={12} className="mr-1" />
              {t('homework.title')}
            </Badge>
          )}
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? t('courses.live') : t('courses.draft')}
          </Badge>
          {isHomework && (
            <Link href={`/dashboard/courses/${lesson.course_id}/lessons/${lesson.id}/submissions`}>
              <Button size="sm" variant="outline">
                {t('homework.viewSubmissions')}
              </Button>
            </Link>
          )}
          <Button size="sm" variant="outline" onClick={handleTogglePublish}>
            {isPublished ? t('common.unpublish') : t('common.publish')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {/* Lesson title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            placeholder={t('lessons.lessonTitle')}
            className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 mb-6"
          />

          {/* Homework settings */}
          {isHomework && homeworkMeta && (
            <div className="mb-6 pb-6 border-b flex flex-col gap-4">
              <HomeworkSettingsPanel lessonId={lesson.id} meta={homeworkMeta} />
              {enrolledStudents && (
                <StudentAssignmentSelect
                  lessonId={lesson.id}
                  enrolledStudents={enrolledStudents}
                  initialAssignments={homeworkAssignments || []}
                />
              )}
            </div>
          )}

          {/* Teacher assignment */}
          {allTeachers && lessonTeachers !== undefined && (
            <div className="mb-6 pb-6 border-b">
              <TeacherAssignPanel
                lessonId={lesson.id}
                assignedTeachers={lessonTeachers}
                allTeachers={allTeachers}
              />
            </div>
          )}

          {/* Lesson settings */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 pb-6 border-b">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                size="sm"
                checked={sequentialBlocks}
                onCheckedChange={handleToggleSequential}
              />
              <div>
                <p className="text-sm font-medium leading-none">{t('lessons.sequentialBlocks')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('lessons.sequentialBlocksDesc')}
                </p>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                size="sm"
                checked={requirePrevious}
                onCheckedChange={handleToggleRequirePrevious}
              />
              <div>
                <p className="text-sm font-medium leading-none">
                  {t('lessons.requirePreviousLesson')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('lessons.requirePreviousLessonDesc')}
                </p>
              </div>
            </label>
          </div>

          {/* Blocks */}
          {blocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t('lessons.noBlocksDesc')}</p>
              <BlockPicker onSelect={(type) => handleAddBlock(type, -1)}>
                <span className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md border border-border text-base font-medium hover:bg-muted transition-colors cursor-pointer">
                  <Plus size={16} />
                  {t('blocks.addBlock')}
                </span>
              </BlockPicker>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AddBlockDivider onSelect={(type) => handleAddBlock(type, -1)} />
              {blocks.map((block, index) => (
                <div key={block.id}>
                  <BlockWrapper
                    type={block.type}
                    isActive={activeBlockId === block.id}
                    onFocus={() => setActiveBlock(block.id)}
                    onDelete={() => removeBlock(block.id)}
                  >
                    <BlockEditor
                      block={block}
                      onChange={(content) => updateBlockContent(block.id, content)}
                    />
                  </BlockWrapper>
                  <AddBlockDivider onSelect={(type) => handleAddBlock(type, index)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save status */}
      <div className="text-right px-4 py-2 shrink-0">
        <SaveStatus saving={saving} error={saveError} savedAt={!isDirty ? lastSaved : null} />
      </div>
    </div>
  )
}
