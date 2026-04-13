import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  COLOR_SCHEMES,
  type ColorSchemeKey,
  getContrastForeground,
} from '@/features/settings/model/color-schemes.config'
import { createClient } from '@/shared/api/supabase.server'
import { GraduationCap } from 'lucide-react'

import { StudentUserMenu } from '@/components/layout/StudentUserMenu'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, school_id, avatar_url')
    .eq('user_id', user.id)
    .single()

  let schoolName = 'Verbify'
  let schoolLogoUrl: string | null = null
  let schoolColorScheme: string | null = null

  if (profile?.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name, logo_url, color_scheme')
      .eq('id', profile.school_id)
      .single()

    if (school) {
      schoolName = school.name
      schoolLogoUrl = school.logo_url
      schoolColorScheme = school.color_scheme
    }
  }

  const scheme =
    COLOR_SCHEMES[(schoolColorScheme as ColorSchemeKey) ?? 'default'] ?? COLOR_SCHEMES.default
  const themeVars = {
    '--primary': scheme.primary,
    '--primary-foreground': getContrastForeground(scheme.primary),
    '--ring': scheme.primary,
    '--accent': scheme.accent,
  } as React.CSSProperties

  return (
    <div className="min-h-screen flex flex-col" style={themeVars}>
      <header
        className="h-20 border-b flex items-center justify-between px-6 shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <Link href="/learn" className="flex items-center gap-3">
          {schoolLogoUrl ? (
            <Image
              src={schoolLogoUrl}
              alt={schoolName}
              width={32}
              height={32}
              className="rounded object-cover"
            />
          ) : (
            <GraduationCap size={24} />
          )}
          <h1 className="font-semibold text-base">{schoolName}</h1>
        </Link>
        <StudentUserMenu
          userName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </header>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
