'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { OpenAnswerBlockContent } from '../../../types'

interface OpenAnswerBlockProps {
  content: OpenAnswerBlockContent
  onChange: (content: OpenAnswerBlockContent) => void
}

export function OpenAnswerBlock({ content, onChange }: OpenAnswerBlockProps) {
  const t = useTranslations('blocks')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm">{t('openAnswerPrompt')}</Label>
        <Textarea
          value={content.prompt || ''}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          placeholder={t('openAnswerPromptPlaceholder')}
          className="text-sm min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">{t('openAnswerMinLength')}</Label>
          <Input
            type="number"
            min={0}
            value={content.min_length || 0}
            onChange={(e) => onChange({ ...content, min_length: parseInt(e.target.value) || 0 })}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm">{t('openAnswerMaxLength')}</Label>
          <Input
            type="number"
            min={0}
            value={content.max_length || 5000}
            onChange={(e) => onChange({ ...content, max_length: parseInt(e.target.value) || 5000 })}
            className="text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">{t('openAnswerPreviewNote')}</p>
      </div>
    </div>
  )
}
