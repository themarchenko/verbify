'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'

import type { VideoBlockContent } from '../../../types'

interface VideoBlockProps {
  content: VideoBlockContent
  onChange: (content: VideoBlockContent) => void
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] || null
}

export function VideoBlock({ content, onChange }: VideoBlockProps) {
  const t = useTranslations('blocks')
  const youtubeId = content.url ? getYouTubeId(content.url) : null

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={content.url || ''}
        onChange={(e) => onChange({ ...content, url: e.target.value })}
        placeholder={t('videoUrl')}
        className="text-sm"
      />

      {youtubeId && (
        <div className="aspect-video rounded-md overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
