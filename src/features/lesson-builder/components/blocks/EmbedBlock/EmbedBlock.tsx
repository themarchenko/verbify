'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { AlertTriangle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { EmbedBlockContent } from '../../../types'

interface EmbedBlockProps {
  content: EmbedBlockContent
  onChange: (content: EmbedBlockContent) => void
}

function detectEmbedUrl(
  url: string
): { embedUrl: string; provider: 'figma' | 'miro' | 'canva' } | null {
  const trimmed = url.trim()

  // Figma: figma.com/file/... or figma.com/design/...
  const figmaMatch = trimmed.match(
    /^https?:\/\/(www\.)?figma\.com\/(file|design|proto|board)\/[a-zA-Z0-9-_]+/
  )
  if (figmaMatch) {
    const encodedUrl = encodeURIComponent(trimmed)
    return {
      embedUrl: `https://www.figma.com/embed?embed_host=verbify&url=${encodedUrl}`,
      provider: 'figma',
    }
  }

  // Miro: miro.com/app/board/ID=/ or miro.com/app/board/ID/
  const miroMatch = trimmed.match(/^https?:\/\/(www\.)?miro\.com\/app\/board\/([a-zA-Z0-9_=-]+)/)
  if (miroMatch) {
    const boardId = miroMatch[2]
    return {
      embedUrl: `https://miro.com/app/live-embed/${boardId}/`,
      provider: 'miro',
    }
  }

  // Canva: canva.com/design/ID/.../edit or /view
  const canvaMatch = trimmed.match(
    /^https?:\/\/(www\.)?canva\.com\/design\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/(edit|view)/
  )
  if (canvaMatch) {
    const designId = canvaMatch[2]
    const slug = canvaMatch[3]
    return {
      embedUrl: `https://www.canva.com/design/${designId}/${slug}/view?embed`,
      provider: 'canva',
    }
  }

  return null
}

export function EmbedBlock({ content, onChange }: EmbedBlockProps) {
  const t = useTranslations('blocks')
  const [urlInput, setUrlInput] = useState(content.source_url || '')

  const detection = useMemo(() => {
    if (content.embed_url) {
      if (content.embed_url.includes('figma.com')) return { provider: 'figma' as const }
      if (content.embed_url.includes('miro.com')) return { provider: 'miro' as const }
      if (content.embed_url.includes('canva.com')) return { provider: 'canva' as const }
    }
    return null
  }, [content.embed_url])

  function handleUrlChange(value: string) {
    setUrlInput(value)
    const result = detectEmbedUrl(value)
    if (result) {
      onChange({ ...content, embed_url: result.embedUrl, source_url: value, embed_code: '' })
    } else {
      onChange({ ...content, embed_url: undefined, source_url: value || undefined })
    }
  }

  const previewUrl = content.embed_url || null
  const previewHtml = !content.embed_url && content.embed_code ? content.embed_code : null
  const height = content.height || 500

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('embedUrl')}</Label>
        <Input
          value={urlInput || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={t('embedUrlPlaceholder')}
          className="text-sm"
        />
      </div>

      {detection?.provider === 'figma' && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">{t('figmaPublicWarning')}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('embedCodeLabel')}</Label>
        <Textarea
          value={content.embed_code || ''}
          onChange={(e) =>
            onChange({ ...content, embed_code: e.target.value, embed_url: undefined })
          }
          placeholder={t('embedCode')}
          rows={3}
          className="text-sm font-mono"
          disabled={!!content.embed_url}
        />
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-xs shrink-0">{t('embedHeight')}</Label>
        <Input
          type="number"
          value={height}
          onChange={(e) => onChange({ ...content, height: parseInt(e.target.value) || 500 })}
          className="w-24 text-sm"
        />
      </div>

      {previewUrl && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('embedPreview')}</Label>
          <div className="border rounded-md overflow-hidden" style={{ height }}>
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              referrerPolicy="no-referrer"
              title="Embed preview"
            />
          </div>
        </div>
      )}

      {previewHtml && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('embedPreview')}</Label>
          <div
            className="border rounded-md overflow-hidden"
            style={{ height }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t('embedWarning')}</p>
    </div>
  )
}
