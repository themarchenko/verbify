'use client'

import { useTranslations } from 'next-intl'

import { Circle, CircleDot, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { QuizBlockContent } from '../../../types'

interface QuizBlockProps {
  content: QuizBlockContent
  onChange: (content: QuizBlockContent) => void
}

export function QuizBlock({ content, onChange }: QuizBlockProps) {
  const t = useTranslations('blocks')
  const questions = content.questions || []

  function updateQuestion(qIndex: number, updates: Partial<QuizBlockContent['questions'][0]>) {
    const updated = questions.map((q, i) => (i === qIndex ? { ...q, ...updates } : q))
    onChange({ ...content, questions: updated })
  }

  function addQuestion() {
    onChange({
      ...content,
      questions: [
        ...questions,
        { id: crypto.randomUUID(), text: '', options: ['', ''], correct_index: 0 },
      ],
    })
  }

  function removeQuestion(qIndex: number) {
    onChange({ ...content, questions: questions.filter((_, i) => i !== qIndex) })
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const q = questions[qIndex]
    const options = q.options.map((o, i) => (i === oIndex ? value : o))
    updateQuestion(qIndex, { options })
  }

  function addOption(qIndex: number) {
    const q = questions[qIndex]
    if (q.options.length >= 6) return
    updateQuestion(qIndex, { options: [...q.options, ''] })
  }

  function removeOption(qIndex: number, oIndex: number) {
    const q = questions[qIndex]
    if (q.options.length <= 2) return
    const options = q.options.filter((_, i) => i !== oIndex)
    const correctIndex = q.correct_index >= options.length ? 0 : q.correct_index
    updateQuestion(qIndex, { options, correct_index: correctIndex })
  }

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, qIndex) => (
        <div key={q.id} className="flex flex-col gap-3">
          {qIndex > 0 && <div className="border-t border-dashed border-border -mx-1 mb-1" />}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('quizQuestion')} {qIndex + 1}
            </span>
            {questions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeQuestion(qIndex)}
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>

          <Input
            value={q.text}
            onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
            placeholder={t('quizQuestion')}
            className="text-sm"
          />

          <div className="flex flex-col gap-1.5 pl-1">
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className="group/option flex items-center gap-2">
                <button
                  type="button"
                  className="shrink-0 flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => updateQuestion(qIndex, { correct_index: oIndex })}
                >
                  {q.correct_index === oIndex ? (
                    <CircleDot size={16} className="text-foreground" />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>
                <Input
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={t('quizOption', { n: oIndex + 1 })}
                  className="flex-1 h-10"
                />
                {q.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover/option:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={() => removeOption(qIndex, oIndex)}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {q.options.length < 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start ml-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => addOption(qIndex)}
            >
              <Plus size={12} className="mr-1" />
              {t('quizAddOption')}
            </Button>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" className="self-start text-sm" onClick={addQuestion}>
        <Plus size={12} className="mr-1" />
        {t('quizAddQuestion')}
      </Button>
    </div>
  )
}
