import { create } from 'zustand'

import type { Block, BlockType } from '../types'

interface BuilderState {
  blocks: Block[]
  activeBlockId: string | null
  // Monotonic counter — incremented on every mutation, used to trigger autosave
  version: number
  savedVersion: number
  saving: boolean
  lastSaved: Date | null
  saveError: boolean

  setBlocks: (blocks: Block[]) => void
  addBlock: (type: BlockType, afterIndex: number, lessonId: string, schoolId: string) => void
  updateBlockContent: (blockId: string, content: Record<string, unknown>) => void
  removeBlock: (blockId: string) => void
  reorderBlocks: (blocks: Block[]) => void
  setActiveBlock: (blockId: string | null) => void
  setSaving: (saving: boolean) => void
  setSaved: () => void
  setSaveError: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  activeBlockId: null,
  version: 0,
  savedVersion: 0,
  saving: false,
  lastSaved: null,
  saveError: false,

  setBlocks: (blocks) => set({ blocks, version: 0, savedVersion: 0 }),

  addBlock: (type, afterIndex, lessonId, schoolId) =>
    set((state) => {
      const newBlock: Block = {
        id: crypto.randomUUID(),
        lesson_id: lessonId,
        school_id: schoolId,
        type,
        order_index: afterIndex + 1,
        content: getDefaultContent(type),
      }
      const blocks = [...state.blocks]
      blocks.splice(afterIndex + 1, 0, newBlock)
      const reindexed = blocks.map((b, i) => ({ ...b, order_index: i }))
      return { blocks: reindexed, version: state.version + 1, activeBlockId: newBlock.id }
    }),

  updateBlockContent: (blockId, content) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
      version: state.version + 1,
    })),

  removeBlock: (blockId) =>
    set((state) => {
      const blocks = state.blocks
        .filter((b) => b.id !== blockId)
        .map((b, i) => ({ ...b, order_index: i }))
      return { blocks, version: state.version + 1, activeBlockId: null }
    }),

  reorderBlocks: (blocks) =>
    set((state) => ({
      blocks: blocks.map((b, i) => ({ ...b, order_index: i })),
      version: state.version + 1,
    })),

  setActiveBlock: (blockId) => set({ activeBlockId: blockId }),

  setSaving: (saving) => set({ saving, saveError: false }),

  setSaved: () =>
    set((state) => ({
      saving: false,
      savedVersion: state.version,
      lastSaved: new Date(),
      saveError: false,
    })),

  setSaveError: () => set({ saving: false, saveError: true }),
}))

function getDefaultContent(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'text':
      return { html: '' }
    case 'quiz':
      return {
        questions: [{ id: crypto.randomUUID(), text: '', options: ['', ''], correct_index: 0 }],
      }
    case 'flashcards':
      return { cards: [{ id: crypto.randomUUID(), front: '', back: '' }] }
    case 'audio':
      return { audio_url: '', title: '' }
    case 'video':
      return { url: '', title: '' }
    case 'embed':
      return { embed_code: '', height: 500 }
    case 'open_answer':
      return { prompt: '', min_length: 0, max_length: 5000 }
    case 'file_upload':
      return {
        prompt: '',
        allowed_extensions: ['pdf', 'jpg', 'png', 'docx'],
        max_file_size_mb: 10,
        max_files: 1,
      }
    case 'fill_in_blank':
      return {
        questions: [{ id: crypto.randomUUID(), sentence: '', hint: '', answers: [''] }],
      }
  }
}
