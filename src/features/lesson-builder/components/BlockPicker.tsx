'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  Code,
  FileText,
  FormInput,
  Headphones,
  HelpCircle,
  Layers,
  MessageSquare,
  Upload,
  Video,
} from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { BlockType } from '../types'

const blockTypes: Array<{ type: BlockType; icon: typeof FileText; key: string }> = [
  { type: 'text', icon: FileText, key: 'text' },
  { type: 'quiz', icon: HelpCircle, key: 'quiz' },
  { type: 'flashcards', icon: Layers, key: 'flashcards' },
  { type: 'audio', icon: Headphones, key: 'audio' },
  { type: 'video', icon: Video, key: 'video' },
  { type: 'embed', icon: Code, key: 'embed' },
  { type: 'open_answer', icon: MessageSquare, key: 'openAnswer' },
  { type: 'file_upload', icon: Upload, key: 'fileUpload' },
  { type: 'fill_in_blank', icon: FormInput, key: 'fillInBlank' },
]

interface BlockPickerProps {
  onSelect: (type: BlockType) => void
  children: React.ReactNode
}

export function BlockPicker({ onSelect, children }: BlockPickerProps) {
  const t = useTranslations('blocks')
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer" onClick={() => setOpen(true)}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[276px] p-2">
        <p className="px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60">
          {t('addBlock')}
        </p>
        <div className="grid grid-cols-3 gap-0.5">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => {
                onSelect(bt.type)
                setOpen(false)
              }}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg py-3.5 px-2 transition-colors hover:bg-accent active:scale-[0.97] cursor-pointer"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-foreground/[0.04] transition-all group-hover:bg-foreground/[0.08] group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <bt.icon
                  size={18}
                  strokeWidth={1.6}
                  className="text-foreground/50 transition-colors group-hover:text-foreground/80"
                />
              </div>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground/70 transition-colors group-hover:text-foreground">
                {t(bt.key)}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
