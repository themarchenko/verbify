'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'

export async function createCourse(title: string, description?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description: description || null,
      school_id: profile.school_id,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/courses')
  return data
}

export async function updateCourse(
  courseId: string,
  updates: { title?: string; description?: string | null; is_published?: boolean }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('courses').update(updates).eq('id', courseId)

  if (error) throw error
  revalidatePath('/dashboard/courses')
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) throw error
  revalidatePath('/dashboard/courses')
}

export async function createLesson(courseId: string, title: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')

  // Get next order index
  const { data: existing } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      school_id: profile.school_id,
      title,
      order_index: nextIndex,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath(`/dashboard/courses/${courseId}`)
  return data
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) throw error
  revalidatePath(`/dashboard/courses/${courseId}`)
}

export async function duplicateCourse(
  courseId: string,
  newTitle: string,
  includeStudents: boolean
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')

  // Fetch original course
  const { data: original } = await supabase.from('courses').select('*').eq('id', courseId).single()

  if (!original) throw new Error('Course not found')

  // Create duplicated course as draft
  const { data: newCourse, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: newTitle,
      description: original.description,
      cover_url: original.cover_url,
      is_published: false,
      school_id: profile.school_id,
      created_by: profile.id,
    })
    .select()
    .single()

  if (courseError) throw courseError

  // Duplicate lessons and their blocks
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  if (lessons && lessons.length > 0) {
    for (const lesson of lessons) {
      const { data: newLesson } = await supabase
        .from('lessons')
        .insert({
          course_id: newCourse.id,
          school_id: profile.school_id,
          title: lesson.title,
          order_index: lesson.order_index,
          is_published: false,
          require_previous_completion: lesson.require_previous_completion,
          sequential_blocks: lesson.sequential_blocks,
        })
        .select()
        .single()

      if (!newLesson) continue

      // Duplicate lesson blocks
      const { data: blocks } = await supabase
        .from('lesson_blocks')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true })

      if (blocks && blocks.length > 0) {
        await supabase.from('lesson_blocks').insert(
          blocks.map((block) => ({
            lesson_id: newLesson.id,
            school_id: profile.school_id,
            type: block.type,
            content: block.content,
            order_index: block.order_index,
          }))
        )
      }
    }
  }

  // Duplicate enrollments if requested
  if (includeStudents) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)

    if (enrollments && enrollments.length > 0) {
      await supabase.from('enrollments').insert(
        enrollments.map((e) => ({
          course_id: newCourse.id,
          student_id: e.student_id,
          school_id: profile.school_id,
          expires_at: e.expires_at,
        }))
      )
    }
  }

  revalidatePath('/dashboard/courses')
  return newCourse
}

export async function duplicateLesson(lessonId: string, courseId: string, newTitle: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.school_id) throw new Error('No school')

  // Fetch original lesson
  const { data: original } = await supabase.from('lessons').select('*').eq('id', lessonId).single()

  if (!original) throw new Error('Lesson not found')

  // Get next order index
  const { data: existing } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  // Create duplicated lesson as draft
  const { data: newLesson, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      school_id: profile.school_id,
      title: newTitle,
      order_index: nextIndex,
      is_published: false,
      require_previous_completion: original.require_previous_completion,
      sequential_blocks: original.sequential_blocks,
    })
    .select()
    .single()

  if (error) throw error

  // Duplicate blocks
  const { data: blocks } = await supabase
    .from('lesson_blocks')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true })

  if (blocks && blocks.length > 0) {
    await supabase.from('lesson_blocks').insert(
      blocks.map((block) => ({
        lesson_id: newLesson.id,
        school_id: profile.school_id,
        type: block.type,
        content: block.content,
        order_index: block.order_index,
      }))
    )
  }

  revalidatePath(`/dashboard/courses/${courseId}`)
  return newLesson
}

export async function reorderLessons(courseId: string, orderedIds: string[]) {
  const supabase = await createClient()

  const updates = orderedIds.map((id, index) =>
    supabase.from('lessons').update({ order_index: index }).eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error

  revalidatePath(`/dashboard/courses/${courseId}`)
}
