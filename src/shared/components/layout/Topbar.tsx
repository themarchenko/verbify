'use client'

import { useTranslations } from 'next-intl'

import { LogOut, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface TopbarProps {
  onMenuClick?: () => void
  onSignOut: () => void
}

export function Topbar({ onMenuClick, onSignOut }: TopbarProps) {
  const t = useTranslations()

  return (
    <header
      className="h-14 border-b flex items-center justify-between px-4 shrink-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
      </div>

      <Button variant="ghost" size="icon" onClick={onSignOut} title={t('auth.logout')}>
        <LogOut size={16} />
      </Button>
    </header>
  )
}
