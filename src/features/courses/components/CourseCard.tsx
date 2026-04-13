'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import * as React from 'react'

import { BookOpen, Copy, Eye, EyeOff, MoreVertical, Trash2, Users } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CourseCardProps {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  lessonCount: number
  studentCount: number
  onDelete: (id: string) => void
  onDuplicate: (id: string, title: string) => void
  onTogglePublish: (id: string, isPublished: boolean) => void
}

export function CourseCard({
  id,
  title,
  description,
  isPublished,
  lessonCount,
  studentCount,
  onDelete,
  onDuplicate,
  onTogglePublish,
}: CourseCardProps) {
  const t = useTranslations()
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div
      className={`group relative flex flex-col border border-border/60 rounded-xl bg-white card-interactive overflow-hidden ${menuOpen ? 'is-menu-open' : ''}`}
    >
      <Link href={`/dashboard/courses/${id}`} className="flex flex-col flex-1">
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                isPublished ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isPublished ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'
                }`}
              />
              {isPublished ? t('courses.live') : t('courses.draft')}
            </span>
          </div>

          <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 mb-1">{title}</h3>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border/40 px-5 py-3 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {lessonCount}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {studentCount}
          </span>
        </div>
      </Link>

      <div className="absolute top-3 right-3">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger className="inline-flex items-center justify-center size-8 rounded-lg opacity-0 group-hover:opacity-100 group-[.is-menu-open]:opacity-100 hover:bg-muted transition-all cursor-pointer">
            <MoreVertical size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onClick={() => onTogglePublish(id, isPublished)}>
              {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              {isPublished ? t('common.unpublish') : t('common.publish')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(id, title)}>
              <Copy size={14} />
              {t('courses.duplicateCourse')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive whitespace-nowrap"
              onClick={() => onDelete(id)}
            >
              <Trash2 size={14} />
              {t('courses.deleteCourse')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
