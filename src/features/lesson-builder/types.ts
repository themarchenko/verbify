export type BlockType =
  | 'text'
  | 'quiz'
  | 'flashcards'
  | 'audio'
  | 'video'
  | 'embed'
  | 'open_answer'
  | 'file_upload'
  | 'fill_in_blank'

export type Block = {
  id: string
  lesson_id: string
  school_id: string
  type: BlockType
  order_index: number
  content: Record<string, unknown>
}

export type TextBlockContent = {
  html: string
}

export type FlashcardsBlockContent = {
  cards: Array<{
    id: string
    front: string
    back: string
    transcription?: string
    audio_url?: string
  }>
}

export type QuizBlockContent = {
  questions: Array<{
    id: string
    text: string
    options: string[]
    correct_index: number
    explanation?: string
  }>
}

export type AudioBlockContent = {
  audio_url: string
  title?: string
  transcript?: string
}

export type VideoBlockContent = {
  url: string
  title?: string
}

export type EmbedBlockContent = {
  embed_code: string
  embed_url?: string
  source_url?: string
  height?: number
}

export type OpenAnswerBlockContent = {
  prompt: string
  min_length?: number
  max_length?: number
}

export type FileUploadBlockContent = {
  prompt: string
  allowed_extensions?: string[]
  max_file_size_mb?: number
  max_files?: number
}

export type FillInBlankBlockContent = {
  questions: Array<{
    id: string
    sentence: string
    hint?: string
    answers: string[]
    explanation?: string
  }>
}
