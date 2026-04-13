'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/shared/api/supabase.server'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'loginError' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  const redirectPath = profile?.role === 'student' ? '/learn' : '/dashboard'
  redirect(redirectPath)
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return { error: 'registerError' }
  }

  return { error: null }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(fullName: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  return { error: null }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated', avatarUrl: null }

    const file = formData.get('file') as File | null
    if (!file) return { error: 'No file provided', avatarUrl: null }
    if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2MB)', avatarUrl: null }

    const contentType = file.type || 'image/webp'
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : 'webp'
    const path = `${user.id}/avatar.${ext}`

    // Remove old avatar files first (may have different extension)
    const { data: existing } = await supabase.storage.from('avatars').list(user.id)
    if (existing && existing.length > 0) {
      await supabase.storage.from('avatars').remove(existing.map((f) => `${user.id}/${f.name}`))
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType })

    if (uploadError) return { error: uploadError.message, avatarUrl: null }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)

    if (updateError) return { error: updateError.message, avatarUrl: null }

    return { error: null, avatarUrl: publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error', avatarUrl: null }
  }
}

export async function removeAvatar() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: files } = await supabase.storage.from('avatars').list(user.id)

    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(paths)
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id)

    if (error) return { error: error.message }

    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return { error: 'Not authenticated' }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) return { error: 'incorrectPassword' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }

  return { error: null }
}
