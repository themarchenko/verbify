'use client'

import type { Block } from '../types'
import { AudioBlock } from './blocks/AudioBlock/AudioBlock'
import { EmbedBlock } from './blocks/EmbedBlock/EmbedBlock'
import { FileUploadBlock } from './blocks/FileUploadBlock/FileUploadBlock'
import { FlashcardsBlock } from './blocks/FlashcardsBlock/FlashcardsBlock'
import { OpenAnswerBlock } from './blocks/OpenAnswerBlock/OpenAnswerBlock'
import { QuizBlock } from './blocks/QuizBlock/QuizBlock'
import { TextBlock } from './blocks/TextBlock/TextBlock'
import { VideoBlock } from './blocks/VideoBlock/VideoBlock'

interface BlockEditorProps {
  block: Block
  onChange: (content: Record<string, unknown>) => void
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content as { html: string }} onChange={onChange} />
    case 'quiz':
      return (
        <QuizBlock
          content={
            block.content as {
              questions: Array<{
                id: string
                text: string
                options: string[]
                correct_index: number
                explanation?: string
              }>
            }
          }
          onChange={onChange}
        />
      )
    case 'flashcards':
      return (
        <FlashcardsBlock
          content={
            block.content as {
              cards: Array<{
                id: string
                front: string
                back: string
                transcription?: string
                audio_url?: string
              }>
            }
          }
          onChange={onChange}
          blockId={block.id}
          schoolId={block.school_id}
        />
      )
    case 'audio':
      return (
        <AudioBlock
          content={block.content as { audio_url: string; title?: string; transcript?: string }}
          onChange={onChange}
          blockId={block.id}
          schoolId={block.school_id}
        />
      )
    case 'video':
      return (
        <VideoBlock
          content={block.content as { url: string; title?: string }}
          onChange={onChange}
        />
      )
    case 'embed':
      return (
        <EmbedBlock
          content={block.content as { embed_code: string; height?: number }}
          onChange={onChange}
        />
      )
    case 'open_answer':
      return (
        <OpenAnswerBlock
          content={block.content as { prompt: string; min_length?: number; max_length?: number }}
          onChange={onChange}
        />
      )
    case 'file_upload':
      return (
        <FileUploadBlock
          content={
            block.content as {
              prompt: string
              allowed_extensions?: string[]
              max_file_size_mb?: number
              max_files?: number
            }
          }
          onChange={onChange}
        />
      )
    default:
      return null
  }
}
