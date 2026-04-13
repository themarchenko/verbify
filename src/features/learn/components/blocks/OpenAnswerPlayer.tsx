'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { saveOpenAnswerProgress } from '@/features/homework/api/homework.mutations'
import { useDebounce } from '@/hooks/useDebounce'

import { Textarea } from '@/components/ui/textarea'

interface OpenAnswerPlayerProps {
  content: {
    prompt: string
    min_length?: number
    max_length?: number
  }
  blockId: string
  lessonId: string
  onComplete: () => void
  readOnly?: boolean
  initialResponse?: string
  teacherFeedback?: string
}

export function OpenAnswerPlayer({
  content,
  blockId,
  lessonId,
  onComplete,
  readOnly,
  initialResponse,
  teacherFeedback,
}: OpenAnswerPlayerProps) {
  const t = useTranslations('homework')
  const [text, setText] = useState(initialResponse || '')
  const debouncedText = useDebounce(text, 800)

  const minLength = content.min_length || 0
  const maxLength = content.max_length || 5000
  const isValid = text.trim().length >= minLength

  useEffect(() => {
    if (!debouncedText || readOnly) return
    saveOpenAnswerProgress(blockId, lessonId, debouncedText)
    if (debouncedText.trim().length >= minLength) {
      onComplete()
    }
  }, [debouncedText, blockId, lessonId, minLength, onComplete, readOnly])

  return (
    <div className="flex flex-col gap-3">
      {content.prompt && <p className="font-medium">{content.prompt}</p>}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={readOnly}
        placeholder={t('openAnswerPlaceholder')}
        className="min-h-[120px] text-sm"
        maxLength={maxLength}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {text.length} / {maxLength}
          {minLength > 0 && !isValid && ` (${t('minChars', { count: minLength })})`}
        </span>
      </div>

      {teacherFeedback && (
        <div className="rounded-lg border bg-blue-50 p-3 mt-2">
          <p className="text-xs font-medium text-blue-700 mb-1">{t('teacherFeedback')}</p>
          <p className="text-sm">{teacherFeedback}</p>
        </div>
      )}
    </div>
  )
}
