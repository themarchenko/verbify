import { createClient } from '@/shared/api/supabase.server'

export async function getSchoolSettings(schoolId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schools')
    .select('name, slug, logo_url, custom_domain, color_scheme, login_heading, login_subheading')
    .eq('id', schoolId)
    .single()

  if (error) throw new Error(error.message)

  return data
}
