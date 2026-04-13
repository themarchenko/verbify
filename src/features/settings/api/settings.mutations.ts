'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/api/supabase.server'
import { requireOwner } from '@/shared/lib/auth-guards'

import { COLOR_SCHEMES } from '../model/color-schemes.config'
import { updateCustomDomainSchema, updateSchoolNameSchema } from '../model/settings.schema'

function revalidateAll() {
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/learn', 'layout')
}

export async function updateSchoolName(name: string) {
  try {
    const parsed = updateSchoolNameSchema.parse({ name })
    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    const { error } = await supabase
      .from('schools')
      .update({ name: parsed.name })
      .eq('id', schoolId)

    if (error) return { error: error.message }

    revalidateAll()
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function uploadSchoolLogo(formData: FormData) {
  try {
    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    const file = formData.get('file') as File | null
    if (!file) return { error: 'No file provided', logoUrl: null }
    if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2MB)', logoUrl: null }

    const contentType = file.type || 'image/webp'
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : 'webp'
    const path = `${schoolId}/logo.${ext}`

    // Remove old logo files first (may have different extension)
    const { data: existing } = await supabase.storage.from('school-logos').list(schoolId)
    if (existing && existing.length > 0) {
      await supabase.storage
        .from('school-logos')
        .remove(existing.map((f) => `${schoolId}/${f.name}`))
    }

    const { error: uploadError } = await supabase.storage
      .from('school-logos')
      .upload(path, file, { upsert: true, contentType })

    if (uploadError) return { error: uploadError.message, logoUrl: null }

    const {
      data: { publicUrl },
    } = supabase.storage.from('school-logos').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('schools')
      .update({ logo_url: publicUrl })
      .eq('id', schoolId)

    if (updateError) return { error: updateError.message, logoUrl: null }

    revalidateAll()
    return { error: null, logoUrl: publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error', logoUrl: null }
  }
}

export async function removeSchoolLogo() {
  try {
    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    // List files in the school's folder and remove them
    const { data: files } = await supabase.storage.from('school-logos').list(schoolId)

    if (files && files.length > 0) {
      const paths = files.map((f) => `${schoolId}/${f.name}`)
      await supabase.storage.from('school-logos').remove(paths)
    }

    const { error } = await supabase.from('schools').update({ logo_url: null }).eq('id', schoolId)

    if (error) return { error: error.message }

    revalidateAll()
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function updateCustomDomain(domain: string | null) {
  try {
    const parsed = updateCustomDomainSchema.parse({ customDomain: domain || null })
    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    const { error } = await supabase
      .from('schools')
      .update({ custom_domain: parsed.customDomain })
      .eq('id', schoolId)

    if (error) return { error: error.message }

    revalidateAll()
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function updateColorScheme(scheme: string) {
  try {
    if (!(scheme in COLOR_SCHEMES)) return { error: 'Invalid color scheme' }

    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    const { error } = await supabase
      .from('schools')
      .update({ color_scheme: scheme })
      .eq('id', schoolId)

    if (error) return { error: error.message }

    revalidateAll()
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function updateLoginBranding(heading: string, subheading: string) {
  try {
    const { schoolId } = await requireOwner()
    const supabase = await createClient()

    const { error } = await supabase
      .from('schools')
      .update({
        login_heading: heading || null,
        login_subheading: subheading || null,
      })
      .eq('id', schoolId)

    if (error) return { error: error.message }

    revalidateAll()
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
