'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'

import type { Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface TextBlockToolbarProps {
  editor: Editor
}

export function TextBlockToolbar({ editor }: TextBlockToolbarProps) {
  const t = useTranslations('blocks.toolbar')
  const [linkInput, setLinkInput] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const setLink = useCallback(() => {
    if (!linkInput) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setShowLinkInput(false)
      return
    }

    // Validate URL before setting
    let url = linkInput.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }

    try {
      new URL(url)
    } catch {
      setShowLinkInput(false)
      setLinkInput('')
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setShowLinkInput(false)
    setLinkInput('')
  }, [editor, linkInput])

  const toggleLinkInput = useCallback(() => {
    if (showLinkInput) {
      setShowLinkInput(false)
      setLinkInput('')
      return
    }

    const existingUrl = editor.getAttributes('link').href || ''
    setLinkInput(existingUrl)
    setShowLinkInput(true)
  }, [editor, showLinkInput])

  const items = [
    {
      icon: Bold,
      title: t('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: t('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: Underline,
      title: t('underline'),
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: Strikethrough,
      title: t('strikethrough'),
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    { type: 'divider' as const },
    {
      icon: Heading2,
      title: t('heading2'),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      title: t('heading3'),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    { type: 'divider' as const },
    {
      icon: List,
      title: t('bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: t('orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    { type: 'divider' as const },
    {
      icon: Quote,
      title: t('blockquote'),
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      icon: Code,
      title: t('code'),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
    {
      icon: Link,
      title: t('link'),
      action: toggleLinkInput,
      isActive: editor.isActive('link'),
    },
  ]

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border pb-2">
        {items.map((item, index) => {
          if ('type' in item && item.type === 'divider') {
            return <div key={index} className="mx-1 h-5 w-px bg-border" />
          }

          const {
            icon: Icon,
            title,
            action,
            isActive,
          } = item as {
            icon: typeof Bold
            title: string
            action: () => void
            isActive: boolean
          }

          return (
            <Button
              key={title}
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.preventDefault()
                action()
              }}
              className={cn(isActive && 'bg-muted')}
              title={title}
            >
              <Icon size={14} />
            </Button>
          )
        })}
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 py-1">
          <Input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://example.com"
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setLink()
              }
              if (e.key === 'Escape') {
                setShowLinkInput(false)
                setLinkInput('')
              }
            }}
            autoFocus
          />
          <Button variant="outline" size="xs" onClick={setLink}>
            {t('applyLink')}
          </Button>
        </div>
      )}
    </div>
  )
}
