'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SaveIndicator } from '@/features/settings/components/SaveIndicator'

import { cn } from '@/lib/utils'

const settingsTabs = [
  { key: 'general', href: '/dashboard/settings' },
  { key: 'brandingSection', href: '/dashboard/settings/branding' },
  { key: 'domainSection', href: '/dashboard/settings/domain' },
  { key: 'billing', href: '/dashboard/settings/billing' },
] as const

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('settings')
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

      <div className="flex gap-8">
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          {settingsTabs.map((tab) => {
            const isActive =
              tab.href === '/dashboard/settings'
                ? pathname === '/dashboard/settings'
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

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <SaveIndicator />
    </div>
  )
}
