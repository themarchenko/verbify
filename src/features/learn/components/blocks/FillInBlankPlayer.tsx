'use client'

import { useTranslations } from 'next-intl'
import { Fragment, useState } from 'react'

import type { FillInBlankBlockContent } from '@/features/lesson-builder/types'
import { Check, ChevronRight, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { saveProgress } from '../../api/learn.mutations'

interface FillInBlankPlayerProps {
  content: FillInBlankBlockContent
  blockId: string
  lessonId: string
  onComplete: () => void
}

// Parse "Juan no {{1}} sus gafas." into segments like:
// [{ type: 'text', value: 'Juan no ' }, { type: 'blank', index: 0 }, { type: 'text', value: ' sus gafas.' }]
function parseSentence(sentence: string) {
  const parts: Array<{ type: 'text'; value: string } | { type: 'blank'; index: number }> = []
  const regex = /\{\{(\d+)\}\}/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: sentence.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'blank', index: parseInt(match[1], 10) - 1 })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < sentence.length) {
    parts.push({ type: 'text', value: sentence.slice(lastIndex) })
  }

  return parts
}

export function FillInBlankPlayer({
  content,
  blockId,
  lessonId,
  onComplete,
}: FillInBlankPlayerProps) {
  const t = useTranslations('learn')
  const questions = content.questions || []
  const [currentQ, setCurrentQ] = useState(0)
  // answers[qIndex][blankIndex] = student's typed answer
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({})
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalBlanks, setTotalBlanks] = useState(0)

  const question = questions[currentQ]
  if (!question && !completed) return null

  const parts = question ? parseSentence(question.sentence) : []
  const currentAnswers = answers[currentQ] || {}

  function setAnswer(blankIndex: number, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQ]: { ...(prev[currentQ] || {}), [blankIndex]: value },
    }))
  }

  function isBlankCorrect(blankIndex: number): boolean {
    const studentAnswer = (currentAnswers[blankIndex] || '').trim().toLowerCase()
    const correctAnswer = (question.answers[blankIndex] || '').trim().toLowerCase()
    return studentAnswer === correctAnswer
  }

  function handleCheck() {
    const blanksInQ = question.answers.length
    let correct = 0
    for (let i = 0; i < blanksInQ; i++) {
      if (isBlankCorrect(i)) correct++
    }

    setTotalCorrect((prev) => prev + correct)
    setTotalBlanks((prev) => prev + blanksInQ)
    setChecked(true)

    if (currentQ === questions.length - 1) {
      const finalCorrect = totalCorrect + correct
      const finalBlanks = totalBlanks + blanksInQ
      const score = finalBlanks > 0 ? Math.round((finalCorrect / finalBlanks) * 100) : 0
      saveProgress(blockId, lessonId, true, score)
      setTimeout(() => {
        setCompleted(true)
        onComplete()
      }, 1500)
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setChecked(false)
    }
  }

  if (completed) {
    const score = totalBlanks > 0 ? Math.round((totalCorrect / totalBlanks) * 100) : 0
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Check size={24} className="text-green-600" />
        <p className="font-medium">{t('taskComplete')}</p>
        <p className="text-sm text-muted-foreground">{t('score', { score })}</p>
      </div>
    )
  }

  const allFilled = question.answers.every((_, i) => (currentAnswers[i] || '').trim().length > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {currentQ + 1} / {questions.length}
        </Badge>
        {question.hint && (
          <span className="text-sm text-muted-foreground italic">({question.hint})</span>
        )}
      </div>

      {/* Sentence with inline inputs */}
      <div className="text-base leading-relaxed flex flex-wrap items-baseline gap-y-2">
        {parts.map((part, i) => (
          <Fragment key={i}>
            {part.type === 'text' ? (
              <span>{part.value}</span>
            ) : (
              <span className="inline-flex items-center mx-1">
                <input
                  type="text"
                  value={currentAnswers[part.index] || ''}
                  onChange={(e) => setAnswer(part.index, e.target.value)}
                  disabled={checked}
                  autoComplete="off"
                  className={`inline-block w-32 border-b-2 bg-transparent px-1 py-0.5 text-center text-base outline-none transition-colors ${
                    checked
                      ? isBlankCorrect(part.index)
                        ? 'border-green-500 text-green-700 font-medium'
                        : 'border-red-500 text-red-600 line-through'
                      : 'border-foreground/30 focus:border-foreground'
                  }`}
                  placeholder={`${part.index + 1}`}
                />
                {checked && !isBlankCorrect(part.index) && (
                  <span className="ml-1 text-sm font-medium text-green-700">
                    {question.answers[part.index]}
                  </span>
                )}
              </span>
            )}
          </Fragment>
        ))}
      </div>

      {/* Check / feedback / next */}
      {checked ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {question.answers.every((_, i) => isBlankCorrect(i)) ? (
              <>
                <Check size={14} className="text-green-600" />
                <span className="text-sm font-medium text-green-600">{t('correct')}</span>
              </>
            ) : (
              <>
                <X size={14} className="text-red-600" />
                <span className="text-sm font-medium text-red-600">{t('incorrect')}</span>
              </>
            )}
          </div>
          {currentQ < questions.length - 1 && (
            <Button size="sm" onClick={handleNext}>
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      ) : (
        <Button size="sm" className="self-start" onClick={handleCheck} disabled={!allFilled}>
          {t('fillInBlankCheck')}
        </Button>
      )}
    </div>
  )
}
