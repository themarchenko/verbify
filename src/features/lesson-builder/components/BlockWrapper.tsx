'use client'

import { useTranslations } from 'next-intl'

import { GripVertical, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import type { BlockType } from '../types'

interface BlockWrapperProps {
  type: BlockType
  isActive: boolean
  onFocus: () => void
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
  children: React.ReactNode
}

export function BlockWrapper({
  type,
  isActive,
  onFocus,
  onDelete,
  dragHandleProps,
  children,
}: BlockWrapperProps) {
  const t = useTranslations('blocks')

  return (
    <div
      className={cn(
        'group relative border rounded-xl bg-white p-6 transition-all',
        isActive ? 'border-zinc-400 shadow-sm' : 'border-border hover:border-foreground/15'
      )}
      onClick={onFocus}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Badge variant="secondary" className="text-sm font-normal">
          {t(type)}
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div
        className="absolute left-2 top-5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...dragHandleProps}
      >
        <GripVertical size={18} className="text-muted-foreground" />
      </div>

      <div className="ml-4 mt-8">{children}</div>
    </div>
  )
}
