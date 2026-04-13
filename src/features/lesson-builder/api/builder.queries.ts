import { createClient } from '@/shared/api/supabase.server'

export async function getLessonWithBlocks(lessonId: string) {
  const supabase = await createClient()

  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*, courses(title)')
    .eq('id', lessonId)
    .single()

  if (lessonError) throw lessonError

  const { data: blocks, error: blocksError } = await supabase
    .from('lesson_blocks')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index')

  if (blocksError) throw blocksError

  return {
    lesson,
    blocks: blocks || [],
    courseTitle: (lesson.courses as unknown as { title: string })?.title || '',
  }
}
