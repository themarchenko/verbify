'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Loader2, Mic, Plus, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { removeLessonAudio, uploadLessonAudio } from '../../../api/audio.mutations'
import type { FlashcardsBlockContent } from '../../../types'

interface FlashcardsBlockProps {
  content: FlashcardsBlockContent
  onChange: (content: FlashcardsBlockContent) => void
  blockId: string
  schoolId: string
}

export function FlashcardsBlock({ content, onChange, blockId, schoolId }: FlashcardsBlockProps) {
  const t = useTranslations('blocks')
  const cards = content.cards || []

  function updateCard(
    index: number,
    field: 'front' | 'back' | 'audio_url',
    value: string | undefined
  ) {
    const updated = cards.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    onChange({ ...content, cards: updated })
  }

  function addCard() {
    onChange({
      ...content,
      cards: [...cards, { id: crypto.randomUUID(), front: '', back: '' }],
    })
  }

  function removeCard(index: number) {
    if (cards.length <= 1) return
    const card = cards[index]
    if (card.audio_url) {
      removeLessonAudio(`${schoolId}/${blockId}/${card.id}`)
    }
    onChange({ ...content, cards: cards.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 text-sm text-muted-foreground font-medium">
        <span>{t('flashcardsFront')}</span>
        <span>{t('flashcardsBack')}</span>
        <span className="w-8" />
        <span className="w-8" />
        <span className="w-8" />
      </div>

      {cards.map((card, i) => (
        <FlashcardRow
          key={card.id}
          card={card}
          blockId={blockId}
          schoolId={schoolId}
          canDelete={cards.length > 1}
          onUpdateField={(field, value) => updateCard(i, field, value)}
          onRemove={() => removeCard(i)}
          t={t}
        />
      ))}

      <Button variant="outline" size="sm" className="self-start text-sm" onClick={addCard}>
        <Plus size={12} className="mr-1" />
        {t('flashcardsAddCard')}
      </Button>
    </div>
  )
}

function FlashcardRow({
  card,
  blockId,
  schoolId,
  canDelete,
  onUpdateField,
  onRemove,
  t,
}: {
  card: { id: string; front: string; back: string; audio_url?: string }
  blockId: string
  schoolId: string
  canDelete: boolean
  onUpdateField: (field: 'front' | 'back' | 'audio_url', value: string | undefined) => void
  onRemove: () => void
  t: ReturnType<typeof useTranslations<'blocks'>>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUploadAudio(file: File) {
    if (uploading) return
    setUploading(true)

    const formData = new FormData()
    formData.set('file', file)
    formData.set('schoolId', schoolId)
    formData.set('blockId', blockId)
    formData.set('cardId', card.id)

    const result = await uploadLessonAudio(formData)
    setUploading(false)

    if (result.audioUrl) {
      onUpdateField('audio_url', result.audioUrl)
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleRemoveAudio() {
    await removeLessonAudio(`${schoolId}/${blockId}/${card.id}`)
    onUpdateField('audio_url', undefined)
  }

  return (
    <div className="group/card flex flex-col gap-1.5">
      <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
        <Input
          value={card.front}
          onChange={(e) => onUpdateField('front', e.target.value)}
          placeholder={t('flashcardsFront')}
          className="text-sm"
        />
        <Input
          value={card.back}
          onChange={(e) => onUpdateField('back', e.target.value)}
          placeholder={t('flashcardsBack')}
          className="text-sm"
        />
        <AudioUploadButton
          audioUrl={card.audio_url}
          uploading={uploading}
          onClickUpload={() => fileInputRef.current?.click()}
          onRemove={handleRemoveAudio}
        />
        <AIGenerateButton cardFront={card.front} />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-8 shrink-0 opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          onClick={onRemove}
          disabled={!canDelete}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {card.audio_url && (
        <div className="ml-0 pl-0">
          <audio controls src={card.audio_url} className="h-8 w-full max-w-md" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUploadAudio(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function AudioUploadButton({
  audioUrl,
  uploading,
  onClickUpload,
  onRemove,
}: {
  audioUrl?: string
  uploading: boolean
  onClickUpload: () => void
  onRemove: () => void
}) {
  if (uploading) {
    return (
      <div className="flex items-center justify-center h-10 w-8">
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (audioUrl) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-8 shrink-0 text-green-600 hover:text-destructive hover:bg-destructive/10 transition-all"
        onClick={onRemove}
        title="Remove audio"
      >
        <Volume2 size={14} />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-8 shrink-0 opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-foreground transition-all"
      onClick={onClickUpload}
      title="Upload audio"
    >
      <Mic size={12} />
    </Button>
  )
}

function AIGenerateButton({ cardFront }: { cardFront: string }) {
  const t = useTranslations('blocks')
  const [voice, setVoice] = useState('rachel')
  const [accent, setAccent] = useState('american')
  const [generating, setGenerating] = useState(false)
  const [open, setOpen] = useState(false)

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setOpen(false)
      toast.info(t('aiGenerateInDevelopment'))
    }, 3000)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon',
          className:
            'h-10 w-8 shrink-0 opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-foreground transition-all',
        })}
      >
        <Sparkles size={12} />
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-64 p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">{t('aiGenerateTitle')}</p>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{t('aiVoice')}</Label>
            <Select value={voice} onValueChange={(v) => v && setVoice(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rachel">Rachel</SelectItem>
                <SelectItem value="drew">Drew</SelectItem>
                <SelectItem value="clyde">Clyde</SelectItem>
                <SelectItem value="paul">Paul</SelectItem>
                <SelectItem value="domi">Domi</SelectItem>
                <SelectItem value="bella">Bella</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{t('aiAccent')}</Label>
            <Select value={accent} onValueChange={(v) => v && setAccent(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="american">American</SelectItem>
                <SelectItem value="british">British</SelectItem>
                <SelectItem value="australian">Australian</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" className="w-full" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 size={12} className="mr-1.5 animate-spin" />
            ) : (
              <Sparkles size={12} className="mr-1.5" />
            )}
            {generating ? t('aiGenerating') : t('aiGenerateBtn')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
