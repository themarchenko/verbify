'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { sanitizeHtml } from '@/lib/sanitize'

import type { TextBlockContent } from '../../../types'
import { TextBlockToolbar } from './TextBlockToolbar'

interface TextBlockProps {
  content: TextBlockContent
  onChange: (content: TextBlockContent) => void
}

export function TextBlock({ content, onChange }: TextBlockProps) {
  const t = useTranslations('blocks')

  const handleUpdate = useCallback(
    ({ editor }: { editor: { getHTML: () => string } }) => {
      const rawHtml = editor.getHTML()
      onChange({ html: sanitizeHtml(rawHtml) })
    },
    [onChange]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({
        placeholder: t('textPlaceholder'),
      }),
    ],
    content: content.html || '',
    immediatelyRender: false,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm max-w-none focus:outline-none min-h-[100px]',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="flex flex-col gap-2">
      <TextBlockToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
