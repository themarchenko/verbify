'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'

import type { Block } from '../types'

export async function saveBlocks(lessonId: string, blocks: Block[]) {
  const supabase = await createClient()

  // Delete existing blocks for this lesson
  await supabase.from('lesson_blocks').delete().eq('lesson_id', lessonId)

  if (blocks.length === 0) return

  const { error } = await supabase.from('lesson_blocks').insert(
    blocks.map((b) => ({
      id: b.id,
      lesson_id: b.lesson_id,
      school_id: b.school_id,
      type: b.type,
      order_index: b.order_index,
      content: b.content as unknown as import('@/types/database').Json,
    }))
  )

  if (error) throw error
}

export async function updateLessonTitle(lessonId: string, title: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lessons').update({ title }).eq('id', lessonId)
  if (error) throw error
}

export async function toggleLessonPublish(lessonId: string, isPublished: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('lessons')
    .update({ is_published: isPublished })
    .eq('id', lessonId)
  if (error) throw error
  revalidatePath(`/dashboard/courses`)
}

export async function updateLessonSettings(
  lessonId: string,
  settings: { sequential_blocks?: boolean; require_previous_completion?: boolean }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('lessons').update(settings).eq('id', lessonId)
  if (error) throw error
}
