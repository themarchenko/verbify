'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { UserRole } from '@/features/auth/types'
import { BookOpen, LayoutDashboard, Settings, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'teacher'] },
  { key: 'courses', href: '/dashboard/courses', icon: BookOpen, roles: ['owner', 'teacher'] },
  { key: 'students', href: '/dashboard/students', icon: Users, roles: ['owner', 'teacher'] },
  { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ['owner'] },
] as const

interface MobileNavProps {
  open: boolean
  onClose: () => void
  schoolName: string
  userRole: UserRole
}

export function MobileNav({ open, onClose, schoolName, userRole }: MobileNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const filteredItems = navItems.filter((item) =>
    (item.roles as readonly string[]).includes(userRole)
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside
        className="absolute left-0 top-0 bottom-0 w-60 flex flex-col"
        style={{ background: 'var(--surface-2)' }}
      >
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="font-semibold text-base truncate">{schoolName}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          {filteredItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-md text-base transition-colors',
                  isActive
                    ? 'font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                style={isActive ? { background: 'var(--surface-3)' } : undefined}
              >
                <item.icon size={16} />
                {t(item.key)}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
