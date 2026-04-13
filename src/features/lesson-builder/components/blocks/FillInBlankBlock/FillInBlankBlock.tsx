'use client'

import { useTranslations } from 'next-intl'

import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { FillInBlankBlockContent } from '../../../types'

interface FillInBlankBlockProps {
  content: FillInBlankBlockContent
  onChange: (content: FillInBlankBlockContent) => void
}

export function FillInBlankBlock({ content, onChange }: FillInBlankBlockProps) {
  const t = useTranslations('blocks')
  const questions = content.questions || []

  function updateQuestion(
    qIndex: number,
    updates: Partial<FillInBlankBlockContent['questions'][0]>
  ) {
    const updated = questions.map((q, i) => (i === qIndex ? { ...q, ...updates } : q))
    onChange({ ...content, questions: updated })
  }

  function addQuestion() {
    onChange({
      ...content,
      questions: [
        ...questions,
        { id: crypto.randomUUID(), sentence: '', hint: '', answers: [''] },
      ],
    })
  }

  function removeQuestion(qIndex: number) {
    onChange({ ...content, questions: questions.filter((_, i) => i !== qIndex) })
  }

  function updateAnswer(qIndex: number, aIndex: number, value: string) {
    const q = questions[qIndex]
    const answers = q.answers.map((a, i) => (i === aIndex ? value : a))
    updateQuestion(qIndex, { answers })
  }

  function addAnswer(qIndex: number) {
    const q = questions[qIndex]
    updateQuestion(qIndex, { answers: [...q.answers, ''] })
  }

  function removeAnswer(qIndex: number, aIndex: number) {
    const q = questions[qIndex]
    if (q.answers.length <= 1) return
    updateQuestion(qIndex, { answers: q.answers.filter((_, i) => i !== aIndex) })
  }

  // Count blanks in sentence to show helper text
  function countBlanks(sentence: string) {
    const matches = sentence.match(/\{\{\d+\}\}/g)
    return matches ? matches.length : 0
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">{t('fillInBlankHelp')}</p>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="flex flex-col gap-3">
          {qIndex > 0 && <div className="border-t border-dashed border-border -mx-1 mb-1" />}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('fillInBlankSentence')} {qIndex + 1}
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
            value={q.sentence}
            onChange={(e) => updateQuestion(qIndex, { sentence: e.target.value })}
            placeholder={t('fillInBlankSentencePlaceholder')}
            className="text-sm"
          />

          <div className="flex gap-2">
            <Input
              value={q.hint || ''}
              onChange={(e) => updateQuestion(qIndex, { hint: e.target.value })}
              placeholder={t('fillInBlankHint')}
              className="text-sm flex-1"
            />
          </div>

          <div className="flex flex-col gap-1.5 pl-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('fillInBlankAnswers')} ({countBlanks(q.sentence)}{' '}
              {countBlanks(q.sentence) === 1 ? 'blank' : 'blanks'})
            </span>
            {q.answers.map((answer, aIndex) => (
              <div key={aIndex} className="group/answer flex items-center gap-2">
                <span className="shrink-0 w-6 text-center text-xs font-mono text-muted-foreground">
                  {`{{${aIndex + 1}}}`}
                </span>
                <Input
                  value={answer}
                  onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                  placeholder={t('fillInBlankAnswerPlaceholder', { n: aIndex + 1 })}
                  className="flex-1 h-10"
                />
                {q.answers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover/answer:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={() => removeAnswer(qIndex, aIndex)}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="self-start ml-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => addAnswer(qIndex)}
            >
              <Plus size={12} className="mr-1" />
              {t('fillInBlankAddAnswer')}
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="self-start text-sm" onClick={addQuestion}>
        <Plus size={12} className="mr-1" />
        {t('fillInBlankAddSentence')}
      </Button>
    </div>
  )
}
