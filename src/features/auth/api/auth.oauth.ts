'use client'

import { createClient } from '@/shared/api/supabase.client'

export async function signInWithProvider(provider: 'google' | 'apple') {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
