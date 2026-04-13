'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { ArrowLeft, Check, FileIcon, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { sanitizeHtml } from '@/lib/sanitize'

import { gradeSubmission, saveBlockFeedback } from '../api/homework.mutations'
import { HomeworkStatusBadge } from './HomeworkStatusBadge'

interface BlockWithProgress {
  id: string
  type: string
  content: Record<string, unknown>
  order_index: number
  progress: {
    block_id: string | null
    completed: boolean | null
    score: number | null
    attempts: number | null
    response: Record<string, unknown> | null
  } | null
}

interface HomeworkGradingViewProps {
  lessonId: string
  courseId: string
  lessonTitle: string
  student: { id: string; full_name: string | null; avatar_url: string | null } | null
  blocks: BlockWithProgress[]
  submission: {
    status: string
    score: number | null
    feedback: string | null
    submitted_at: string | null
  } | null
}

export function HomeworkGradingView({
  lessonId,
  courseId,
  lessonTitle,
  student,
  blocks,
  submission,
}: HomeworkGradingViewProps) {
  const t = useTranslations('homework')
  const [score, setScore] = useState(submission?.score ?? 0)
  const [feedback, setFeedback] = useState(submission?.feedback ?? '')
  const [grading, setGrading] = useState(false)
  const [graded, setGraded] = useState(submission?.status === 'graded')

  async function handleGrade() {
    if (!student) return
    setGrading(true)
    await gradeSubmission(lessonId, student.id, { score, feedback })
    setGrading(false)
    setGraded(true)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/courses/${courseId}/lessons/${lessonId}/submissions`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{lessonTitle}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="size-5">
              <AvatarFallback>
                <User size={10} />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {student?.full_name || t('unknownStudent')}
            </span>
            {submission?.status && (
              <HomeworkStatusBadge
                status={submission.status as 'not_started' | 'in_progress' | 'submitted' | 'graded'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Blocks with student responses */}
      <div className="flex flex-col gap-4 mb-8">
        {blocks.map((block) => (
          <Card key={block.id}>
            <CardContent className="p-6">
              <GradingBlockRenderer block={block} studentId={student?.id || ''} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grading form */}
      <div className="rounded-xl border bg-white p-6 flex flex-col gap-4">
        <h3 className="font-semibold">{t('grade')}</h3>

        <div className="flex flex-col gap-2">
          <Label>{t('score')}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            className="w-32"
            disabled={graded}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t('feedback')}</Label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('feedbackPlaceholder')}
            className="min-h-[100px]"
            disabled={graded}
          />
        </div>

        {!graded ? (
          <Button onClick={handleGrade} disabled={grading}>
            {grading ? t('grading') : t('grade')}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <Check size={16} />
            <span className="text-sm font-medium">{t('gradingComplete')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function GradingBlockRenderer({
  block,
  studentId,
}: {
  block: BlockWithProgress
  studentId: string
}) {
  const t = useTranslations('homework')
  const response = block.progress?.response as Record<string, unknown> | null

  switch (block.type) {
    case 'text': {
      const html = (block.content as { html?: string }).html || ''
      const clean = useMemo(() => sanitizeHtml(html), [html])
      return (
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />
      )
    }
    case 'quiz':
      return (
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Quiz</Badge>
          <span className="text-sm">
            {t('score')}: {block.progress?.score ?? '—'}/100
          </span>
          <span className="text-sm text-muted-foreground">
            ({block.progress?.attempts ?? 0} {t('attempts')})
          </span>
        </div>
      )
    case 'flashcards':
      return (
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Flashcards</Badge>
          <span className="text-sm">
            {t('score')}: {block.progress?.score ?? '—'}/100
          </span>
        </div>
      )
    case 'open_answer': {
      const text = (response?.text as string) || ''
      const teacherFeedback = (response?.teacher_feedback as string) || ''
      return (
        <OpenAnswerGrading
          block={block}
          text={text}
          teacherFeedback={teacherFeedback}
          studentId={studentId}
        />
      )
    }
    case 'file_upload': {
      const files = (response?.files as Array<{ name: string; url: string; size: number }>) || []
      const teacherFeedback = (response?.teacher_feedback as string) || ''
      return (
        <FileUploadGrading
          block={block}
          files={files}
          teacherFeedback={teacherFeedback}
          studentId={studentId}
        />
      )
    }
    default:
      return <Badge variant="outline">{block.type}</Badge>
  }
}

function OpenAnswerGrading({
  block,
  text,
  teacherFeedback: initialFeedback,
  studentId,
}: {
  block: BlockWithProgress
  text: string
  teacherFeedback: string
  studentId: string
}) {
  const t = useTranslations('homework')
  const prompt = (block.content as { prompt?: string }).prompt || ''
  const [fb, setFb] = useState(initialFeedback)

  async function handleSaveFeedback() {
    await saveBlockFeedback(block.id, studentId, fb)
  }

  return (
    <div className="flex flex-col gap-3">
      {prompt && <p className="font-medium text-sm">{prompt}</p>}
      <div className="rounded-lg bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground mb-1">{t('studentResponse')}</p>
        <p className="text-sm whitespace-pre-wrap">{text || '—'}</p>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t('teacherFeedback')}</Label>
        <Textarea
          value={fb}
          onChange={(e) => setFb(e.target.value)}
          onBlur={handleSaveFeedback}
          placeholder={t('feedbackPlaceholder')}
          className="text-sm min-h-[60px]"
        />
      </div>
    </div>
  )
}

function FileUploadGrading({
  block,
  files,
  teacherFeedback: initialFeedback,
  studentId,
}: {
  block: BlockWithProgress
  files: Array<{ name: string; url: string; size: number }>
  teacherFeedback: string
  studentId: string
}) {
  const t = useTranslations('homework')
  const prompt = (block.content as { prompt?: string }).prompt || ''
  const [fb, setFb] = useState(initialFeedback)

  async function handleSaveFeedback() {
    await saveBlockFeedback(block.id, studentId, fb)
  }

  return (
    <div className="flex flex-col gap-3">
      {prompt && <p className="font-medium text-sm">{prompt}</p>}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">{t('uploadedFiles')}</p>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          files.map((file, i) => (
            <a
              key={i}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <FileIcon size={14} className="text-muted-foreground" />
              {file.name}
            </a>
          ))
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{t('teacherFeedback')}</Label>
        <Textarea
          value={fb}
          onChange={(e) => setFb(e.target.value)}
          onBlur={handleSaveFeedback}
          placeholder={t('feedbackPlaceholder')}
          className="text-sm min-h-[60px]"
        />
      </div>
    </div>
  )
}
