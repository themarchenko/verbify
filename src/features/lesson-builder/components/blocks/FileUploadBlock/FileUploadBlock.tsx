'use client'

import { useTranslations } from 'next-intl'

import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { FileUploadBlockContent } from '../../../types'

const COMMON_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'png', 'mp3', 'mp4', 'txt', 'xlsx']

interface FileUploadBlockProps {
  content: FileUploadBlockContent
  onChange: (content: FileUploadBlockContent) => void
}

export function FileUploadBlock({ content, onChange }: FileUploadBlockProps) {
  const t = useTranslations('blocks')
  const extensions = content.allowed_extensions || []

  function toggleExtension(ext: string) {
    const updated = extensions.includes(ext)
      ? extensions.filter((e) => e !== ext)
      : [...extensions, ext]
    onChange({ ...content, allowed_extensions: updated })
  }

  function addCustomExtension(ext: string) {
    const clean = ext.replace(/^\./, '').toLowerCase().trim()
    if (clean && !extensions.includes(clean)) {
      onChange({ ...content, allowed_extensions: [...extensions, clean] })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm">{t('fileUploadPrompt')}</Label>
        <Textarea
          value={content.prompt || ''}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          placeholder={t('fileUploadPromptPlaceholder')}
          className="text-sm min-h-[80px]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm">{t('fileUploadAllowedTypes')}</Label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_EXTENSIONS.map((ext) => (
            <Badge
              key={ext}
              variant={extensions.includes(ext) ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs"
              onClick={() => toggleExtension(ext)}
            >
              .{ext}
              {extensions.includes(ext) && <X size={12} className="ml-1" />}
            </Badge>
          ))}
        </div>
        <Input
          placeholder={t('fileUploadCustomExtension')}
          className="text-sm mt-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustomExtension(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">{t('fileUploadMaxSize')}</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={content.max_file_size_mb || 10}
            onChange={(e) =>
              onChange({ ...content, max_file_size_mb: parseInt(e.target.value) || 10 })
            }
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm">{t('fileUploadMaxFiles')}</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={content.max_files || 1}
            onChange={(e) => onChange({ ...content, max_files: parseInt(e.target.value) || 1 })}
            className="text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">{t('fileUploadPreviewNote')}</p>
      </div>
    </div>
  )
}
