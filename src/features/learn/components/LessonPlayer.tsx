'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { submitHomework, updateSubmissionStatus } from '@/features/homework/api/homework.mutations'
import type { HomeworkMeta, HomeworkStatus } from '@/features/homework/types'
import { formatDateFull } from '@/shared/lib/date'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronRight, RotateCcw, Volume2, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { sanitizeEmbed, sanitizeHtml } from '@/lib/sanitize'

import { saveProgress } from '../api/learn.mutations'
import { LessonComplete } from './LessonComplete'
import { FileUploadPlayer } from './blocks/FileUploadPlayer'
import { OpenAnswerPlayer } from './blocks/OpenAnswerPlayer'

interface LessonPlayerProps {
  lesson: {
    id: string
    title: string
    course_id: string | null
    sequential_blocks: boolean | null
    lesson_type?: string
    blocks: Array<{
      id: string
      type: string
      content: Record<string, unknown>
    }>
  }
  courseId: string
  nextLesson: { id: string; title: string } | null
  homeworkMeta?: HomeworkMeta | null
  submissionStatus?: HomeworkStatus | null
  submissionFeedback?: string | null
  submissionScore?: number | null
}

function isInteractiveBlock(type: string) {
  return (
    type === 'quiz' || type === 'flashcards' || type === 'open_answer' || type === 'file_upload'
  )
}

export function LessonPlayer({
  lesson,
  courseId,
  nextLesson,
  homeworkMeta,
  submissionStatus,
  submissionFeedback,
  submissionScore,
}: LessonPlayerProps) {
  const t = useTranslations()
  const locale = useLocale()
  const isHomework = lesson.lesson_type === 'homework'
  const isSubmitted = submissionStatus === 'submitted' || submissionStatus === 'graded'
  const [submitted, setSubmitted] = useState(isSubmitted)
  const [submitting, setSubmitting] = useState(false)
  const sequential = lesson.sequential_blocks ?? true
  // In non-sequential mode, auto-mark non-interactive blocks as completed
  const initialCompleted = useMemo(() => {
    if (sequential) return new Set<string>()
    return new Set(lesson.blocks.filter((b) => !isInteractiveBlock(b.type)).map((b) => b.id))
  }, [sequential, lesson.blocks])
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(initialCompleted)
  const [visibleCount, setVisibleCount] = useState(sequential ? 1 : lesson.blocks.length)

  const handleBlockComplete = useCallback(
    (blockId: string) => {
      setCompletedBlockIds((prev) => {
        const next = new Set(prev)
        next.add(blockId)
        return next
      })
      if (sequential) {
        setVisibleCount((prev) => Math.min(prev + 1, lesson.blocks.length))
      }
    },
    [sequential, lesson.blocks.length]
  )

  const lastBlockRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (sequential && lastBlockRef.current) {
      lastBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [visibleCount, sequential])

  const visibleBlocks = sequential ? lesson.blocks.slice(0, visibleCount) : lesson.blocks
  const allBlocksDone =
    lesson.blocks.length > 0 && lesson.blocks.every((b) => completedBlockIds.has(b.id))

  // Completion section only shows when ALL blocks are done (both modes)
  const showCompletion = allBlocksDone

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" render={<Link href={`/learn/${courseId}`} />}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
      </div>

      {/* Homework deadline banner */}
      {isHomework && homeworkMeta?.due_date && (
        <div className="rounded-lg border bg-amber-50 px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-sm">
            {t('homework.dueSoon', { date: formatDateFull(homeworkMeta.due_date, locale) })}
          </span>
          {submissionStatus && (
            <Badge
              variant={
                submissionStatus === 'graded'
                  ? 'default'
                  : submissionStatus === 'submitted'
                    ? 'secondary'
                    : submissionStatus === 'overdue'
                      ? 'destructive'
                      : 'outline'
              }
            >
              {t(`homework.${submissionStatus}`)}
            </Badge>
          )}
        </div>
      )}

      {/* Graded feedback */}
      {isHomework && submissionStatus === 'graded' && (
        <div className="rounded-lg border bg-green-50 px-4 py-3 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Check size={16} className="text-green-600" />
            <span className="font-medium text-sm">{t('homework.graded')}</span>
            {submissionScore !== null && submissionScore !== undefined && (
              <Badge variant="default">{submissionScore}/100</Badge>
            )}
          </div>
          {submissionFeedback && (
            <p className="text-sm text-muted-foreground mt-1">{submissionFeedback}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {visibleBlocks.map((block, index) => {
            const isLast = index === visibleBlocks.length - 1
            const isCompleted = completedBlockIds.has(block.id)
            const showNextButton =
              sequential && isLast && !isInteractiveBlock(block.type) && !isCompleted

            return (
              <motion.div
                key={block.id}
                ref={isLast ? lastBlockRef : undefined}
                initial={sequential ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <StudentBlockRenderer
                      block={block}
                      lessonId={lesson.id}
                      onComplete={() => handleBlockComplete(block.id)}
                    />
                    {showNextButton && (
                      <div className="flex justify-end mt-4 pt-4 border-t">
                        <Button size="sm" onClick={() => handleBlockComplete(block.id)}>
                          {t('learn.next')}
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {lesson.blocks.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{t('lessons.noBlocksDesc')}</p>
        )}
      </div>

      {showCompletion && !isHomework && (
        <LessonComplete
          lessonId={lesson.id}
          courseId={courseId}
          nextLesson={nextLesson}
          immediate={sequential && allBlocksDone}
        />
      )}

      {/* Homework submit button */}
      {isHomework && allBlocksDone && !submitted && (
        <div className="flex flex-col items-center gap-3 mt-8 py-8 border-t">
          <p className="text-sm text-muted-foreground">{t('homework.submitConfirm')}</p>
          <Button
            size="lg"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true)
              await submitHomework(lesson.id)
              setSubmitted(true)
              setSubmitting(false)
            }}
          >
            {submitting ? t('common.loading') : t('homework.submit')}
          </Button>
        </div>
      )}

      {isHomework && submitted && submissionStatus !== 'graded' && (
        <div className="flex flex-col items-center gap-3 mt-8 py-8 border-t">
          <Check size={24} className="text-green-600" />
          <p className="font-medium">{t('homework.submitted')}</p>
          <p className="text-sm text-muted-foreground">{t('homework.pendingReview')}</p>
        </div>
      )}
    </div>
  )
}

function StudentBlockRenderer({
  block,
  lessonId,
  onComplete,
}: {
  block: { id: string; type: string; content: Record<string, unknown> }
  lessonId: string
  onComplete: () => void
}) {
  switch (block.type) {
    case 'text':
      return <TextPlayer content={block.content as { html: string }} />
    case 'quiz':
      return (
        <QuizPlayer
          content={
            block.content as {
              questions: Array<{
                id: string
                text: string
                options: string[]
                correct_index: number
                explanation?: string
              }>
            }
          }
          blockId={block.id}
          lessonId={lessonId}
          onComplete={onComplete}
        />
      )
    case 'flashcards':
      return (
        <FlashcardsPlayer
          content={
            block.content as {
              cards: Array<{
                id: string
                front: string
                back: string
                transcription?: string
                audio_url?: string
              }>
            }
          }
          blockId={block.id}
          lessonId={lessonId}
          onComplete={onComplete}
        />
      )
    case 'video':
      return <VideoPlayer content={block.content as { url: string }} />
    case 'audio':
      return <AudioPlayer content={block.content as { audio_url: string; transcript?: string }} />
    case 'embed':
      return (
        <EmbedPlayer
          content={block.content as { embed_code: string; embed_url?: string; height?: number }}
        />
      )
    case 'open_answer':
      return (
        <OpenAnswerPlayer
          content={block.content as { prompt: string; min_length?: number; max_length?: number }}
          blockId={block.id}
          lessonId={lessonId}
          onComplete={onComplete}
        />
      )
    case 'file_upload':
      return (
        <FileUploadPlayer
          content={
            block.content as {
              prompt: string
              allowed_extensions?: string[]
              max_file_size_mb?: number
              max_files?: number
            }
          }
          blockId={block.id}
          lessonId={lessonId}
          onComplete={onComplete}
        />
      )
    default:
      return null
  }
}

function TextPlayer({ content }: { content: { html: string } }) {
  const cleanHtml = useMemo(() => sanitizeHtml(content.html || ''), [content.html])

  return (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
  )
}

function QuizPlayer({
  content,
  blockId,
  lessonId,
  onComplete,
}: {
  content: {
    questions: Array<{
      id: string
      text: string
      options: string[]
      correct_index: number
      explanation?: string
    }>
  }
  blockId: string
  lessonId: string
  onComplete: () => void
}) {
  const t = useTranslations('learn')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const questions = content.questions || []
  const question = questions[currentQ]
  if (!question && !completed) return null

  const isCorrect = selected === question?.correct_index

  function handleSelect(index: number) {
    if (answered) return
    setSelected(index)
    setAnswered(true)

    const correct = index === question.correct_index
    if (correct) setCorrectCount((c) => c + 1)

    if (currentQ === questions.length - 1) {
      const finalCorrect = correctCount + (correct ? 1 : 0)
      const score = Math.round((finalCorrect / questions.length) * 100)
      saveProgress(blockId, lessonId, true, score)
      setTimeout(() => {
        setCompleted(true)
        onComplete()
      }, 1200)
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  if (completed) {
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Check size={24} className="text-green-600" />
        <p className="font-medium">{t('taskComplete')}</p>
        <p className="text-sm text-muted-foreground">{t('score', { score })}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {currentQ + 1} / {questions.length}
        </Badge>
      </div>

      <p className="font-medium">{question.text}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              answered && i === question.correct_index
                ? 'border-green-500 bg-green-50'
                : answered && i === selected && !isCorrect
                  ? 'border-red-500 bg-red-50'
                  : 'hover:bg-accent hover:border-foreground/20'
            }`}
            disabled={answered}
          >
            <span className="flex items-center gap-2">
              {answered && i === question.correct_index && (
                <Check size={14} className="text-green-600" />
              )}
              {answered && i === selected && !isCorrect && i !== question.correct_index && (
                <X size={14} className="text-red-600" />
              )}
              {option}
            </span>
          </button>
        ))}
      </div>

      {answered && (
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? t('correct') : t('incorrect')}
          </p>
          {currentQ < questions.length - 1 && (
            <Button size="sm" onClick={handleNext}>
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function FlashcardsPlayer({
  content,
  blockId,
  lessonId,
  onComplete,
}: {
  content: {
    cards: Array<{
      id: string
      front: string
      back: string
      transcription?: string
      audio_url?: string
    }>
  }
  blockId: string
  lessonId: string
  onComplete: () => void
}) {
  const t = useTranslations('learn')
  const initialCards = content.cards || []
  const totalUniqueCards = initialCards.length
  const [deck, setDeck] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [knownCount, setKnownCount] = useState(0)

  const card = deck[currentIndex]
  if (!card && !completed) return null

  function handleShowAnswer() {
    setFlipped(true)
  }

  function handleKnow() {
    const newKnown = knownCount + 1
    setKnownCount(newKnown)
    setFlipped(false)

    const nextIndex = currentIndex + 1
    if (nextIndex >= deck.length) {
      const score = Math.round((newKnown / totalUniqueCards) * 100)
      saveProgress(blockId, lessonId, true, score)
      setCompleted(true)
      onComplete()
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  function handleDontKnow() {
    setDeck((prev) => [...prev, prev[currentIndex]])
    setFlipped(false)
    setCurrentIndex((prev) => prev + 1)
  }

  if (completed) {
    const score = Math.round((knownCount / totalUniqueCards) * 100)
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Check size={24} className="text-green-600" />
        <p className="font-medium">{t('taskComplete')}</p>
        <p className="text-sm text-muted-foreground">{t('score', { score })}</p>
        <p className="text-sm text-muted-foreground">
          {t('flashcardsResult', { known: knownCount, total: totalUniqueCards })}
        </p>
      </div>
    )
  }

  const progressPercent = totalUniqueCards > 0 ? (knownCount / totalUniqueCards) * 100 : 0

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t('cardOf', { current: currentIndex + 1, total: deck.length })}</span>
        <span className="text-border">|</span>
        <span>{t('knownCount', { known: knownCount, total: totalUniqueCards })}</span>
      </div>

      {/* Card with animations */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="w-full flex flex-col items-center"
        >
          <div style={{ perspective: 800 }} className="w-full max-w-sm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                key={flipped ? 'back' : 'front'}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={!flipped ? handleShowAnswer : undefined}
                className={`w-full min-h-48 border rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all ${!flipped ? 'cursor-pointer hover:shadow-md hover:border-foreground/20' : 'cursor-default'}`}
              >
                {!flipped ? (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                      {t('word')}
                    </span>
                    <p className="text-lg font-medium">{card.front}</p>
                    {card.audio_url && <PlayAudioButton src={card.audio_url} />}
                    <span className="text-[11px] text-muted-foreground/60 mt-4">
                      {t('tapToFlip')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {t('word')}
                    </span>
                    <p className="text-sm text-muted-foreground">{card.front}</p>
                    <div className="w-12 border-t my-3" style={{ borderColor: 'var(--border)' }} />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {t('translation')}
                    </span>
                    <p className="text-lg font-medium">{card.back}</p>
                    {card.transcription && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        {card.transcription}
                      </p>
                    )}
                    {card.audio_url && <PlayAudioButton src={card.audio_url} />}
                  </>
                )}
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!flipped ? (
          <Button variant="outline" size="sm" onClick={handleShowAnswer}>
            {t('showAnswer')}
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleDontKnow}>
              <RotateCcw size={14} className="mr-1" />
              {t('dontKnow')}
            </Button>
            <Button size="sm" onClick={handleKnow}>
              <Check size={14} className="mr-1" />
              {t('know')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function PlayAudioButton({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} className="hidden" />
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick(e as unknown as React.MouseEvent)
          }
        }}
        className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors cursor-pointer ${
          playing
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <Volume2 size={12} />
        {playing ? '...' : 'Audio'}
      </span>
    </>
  )
}

function VideoPlayer({ content }: { content: { url: string } }) {
  const match = content.url?.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  const youtubeId = match?.[1]

  if (!youtubeId) return <p className="text-sm text-muted-foreground">No video</p>

  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function AudioPlayer({ content }: { content: { audio_url: string; transcript?: string } }) {
  return (
    <div className="flex flex-col gap-3">
      {content.audio_url && <audio controls src={content.audio_url} className="w-full" />}
      {content.transcript && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.transcript}</p>
      )}
    </div>
  )
}

function EmbedPlayer({
  content,
}: {
  content: { embed_code: string; embed_url?: string; height?: number }
}) {
  const cleanEmbed = useMemo(() => sanitizeEmbed(content.embed_code || ''), [content.embed_code])
  const height = content.height || 500

  if (content.embed_url) {
    return (
      <div className="w-full rounded-md overflow-hidden" style={{ height }}>
        <iframe
          src={content.embed_url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          referrerPolicy="no-referrer"
          allowFullScreen
          title="Embedded content"
        />
      </div>
    )
  }

  if (!cleanEmbed) return null

  return (
    <div
      className="w-full rounded-md overflow-hidden"
      style={{ height }}
      dangerouslySetInnerHTML={{ __html: cleanEmbed }}
    />
  )
}
