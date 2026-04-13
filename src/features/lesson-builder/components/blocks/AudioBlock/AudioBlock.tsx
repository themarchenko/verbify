'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { removeLessonAudio, uploadLessonAudio } from '../../../api/audio.mutations'
import type { AudioBlockContent } from '../../../types'

interface AudioBlockProps {
  content: AudioBlockContent
  onChange: (content: AudioBlockContent) => void
  blockId: string
  schoolId: string
}

export function AudioBlock({ content, onChange, blockId, schoolId }: AudioBlockProps) {
  const t = useTranslations('blocks')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileSelect(file: File) {
    if (uploading) return
    setUploading(true)

    const formData = new FormData()
    formData.set('file', file)
    formData.set('schoolId', schoolId)
    formData.set('blockId', blockId)

    const result = await uploadLessonAudio(formData)
    setUploading(false)

    if (result.audioUrl) {
      onChange({ ...content, audio_url: result.audioUrl })
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleRemoveAudio() {
    await removeLessonAudio(`${schoolId}/${blockId}`)
    onChange({ ...content, audio_url: '' })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {content.audio_url ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <audio controls src={content.audio_url} className="flex-1" />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemoveAudio}
            >
              <Trash2 size={14} />
            </Button>
          </div>
          <Input
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            placeholder="Title"
            className="text-sm"
          />
        </div>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />
          <div
            className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {uploading ? (
              <Loader2 size={24} className="mx-auto text-muted-foreground mb-2 animate-spin" />
            ) : (
              <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? t('audioUploading') : t('audioDrop')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('audioFormats')}</p>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-xs">{t('audioTranscript')}</Label>
        <Textarea
          value={content.transcript || ''}
          onChange={(e) => onChange({ ...content, transcript: e.target.value })}
          placeholder={t('audioTranscript')}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  )
}
