'use server'

import { createClient } from '@/shared/api/supabase.server'

export async function uploadHomeworkFile(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', fileUrl: null, fileName: null }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, school_id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return { error: 'No profile', fileUrl: null, fileName: null }

    const file = formData.get('file') as File | null
    if (!file) return { error: 'No file provided', fileUrl: null, fileName: null }
    if (file.size > 50 * 1024 * 1024)
      return { error: 'File too large (max 50MB)', fileUrl: null, fileName: null }

    const lessonId = formData.get('lessonId') as string
    const blockId = formData.get('blockId') as string

    if (!lessonId || !blockId)
      return { error: 'Missing required fields', fileUrl: null, fileName: null }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const folder = `${profile.school_id}/${lessonId}/${blockId}/${profile.id}`
    const path = `${folder}/${Date.now()}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('homework-files')
      .upload(path, file, { contentType: file.type })

    if (uploadError) return { error: uploadError.message, fileUrl: null, fileName: null }

    const {
      data: { publicUrl },
    } = supabase.storage.from('homework-files').getPublicUrl(path)

    return { error: null, fileUrl: publicUrl, fileName: file.name, fileSize: file.size }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : 'Unknown error',
      fileUrl: null,
      fileName: null,
    }
  }
}

export async function removeHomeworkFile(filePath: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase.storage.from('homework-files').remove([filePath])

    if (error) return { error: error.message }
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
