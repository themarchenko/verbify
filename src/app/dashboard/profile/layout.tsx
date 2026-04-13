'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const profileTabs = [
  { key: 'profileInfo', href: '/dashboard/profile' },
  { key: 'changePassword', href: '/dashboard/profile/password' },
  { key: 'language', href: '/dashboard/profile/language' },
] as const

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('profile')
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

      <div className="flex gap-8">
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          {profileTabs.map((tab) => {
            const isActive =
              tab.href === '/dashboard/profile'
                ? pathname === '/dashboard/profile'
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-base transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {t(tab.key)}
              </Link>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
