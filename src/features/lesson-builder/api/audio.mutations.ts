'use server'

import { createClient } from '@/shared/api/supabase.server'

export async function uploadLessonAudio(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', audioUrl: null }

    const file = formData.get('file') as File | null
    if (!file) return { error: 'No file provided', audioUrl: null }
    if (file.size > 50 * 1024 * 1024) return { error: 'File too large (max 50MB)', audioUrl: null }

    const schoolId = formData.get('schoolId') as string
    const blockId = formData.get('blockId') as string
    const cardId = formData.get('cardId') as string | null

    if (!schoolId || !blockId) return { error: 'Missing required fields', audioUrl: null }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3'
    const folder = cardId ? `${schoolId}/${blockId}/${cardId}` : `${schoolId}/${blockId}`
    const path = `${folder}/audio.${ext}`

    // Remove old files in this folder
    const { data: existing } = await supabase.storage.from('lesson-audio').list(folder)
    if (existing && existing.length > 0) {
      await supabase.storage.from('lesson-audio').remove(existing.map((f) => `${folder}/${f.name}`))
    }

    const { error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) return { error: uploadError.message, audioUrl: null }

    const {
      data: { publicUrl },
    } = supabase.storage.from('lesson-audio').getPublicUrl(path)

    return { error: null, audioUrl: publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error', audioUrl: null }
  }
}

export async function removeLessonAudio(folderPath: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: files } = await supabase.storage.from('lesson-audio').list(folderPath)
    if (files && files.length > 0) {
      await supabase.storage
        .from('lesson-audio')
        .remove(files.map((f) => `${folderPath}/${f.name}`))
    }

    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
