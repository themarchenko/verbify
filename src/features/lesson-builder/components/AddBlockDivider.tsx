'use client'

import { Plus } from 'lucide-react'

import type { BlockType } from '../types'
import { BlockPicker } from './BlockPicker'

interface AddBlockDividerProps {
  onSelect: (type: BlockType) => void
}

export function AddBlockDivider({ onSelect }: AddBlockDividerProps) {
  return (
    <div className="group flex items-center gap-2 py-1 opacity-0 hover:opacity-100 transition-opacity">
      <div className="flex-1 border-t border-dashed border-border" />
      <BlockPicker onSelect={onSelect}>
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors">
          <Plus size={16} />
        </span>
      </BlockPicker>
      <div className="flex-1 border-t border-dashed border-border" />
    </div>
  )
}
