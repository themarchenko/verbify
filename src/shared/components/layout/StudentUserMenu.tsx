'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { signOut } from '@/features/auth/api/auth.mutations'
import { LogOut, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StudentUserMenuProps {
  userName: string | null
  avatarUrl: string | null
}

export function StudentUserMenu({ userName, avatarUrl }: StudentUserMenuProps) {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 pr-3 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName || ''} />}
          <AvatarFallback>{userName?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{userName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="min-w-52 rounded-xl">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <Avatar className="size-10 rounded-lg">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName || ''} />}
            <AvatarFallback className="rounded-lg bg-foreground text-sm font-medium text-background">
              {userName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-sm font-semibold">{userName}</span>
            <Badge variant="secondary" className="mt-0.5 w-fit px-1.5 py-0 text-[10px] capitalize">
              {t('staff.roleStudent')}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('profile.account')}</DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 px-2 py-1.5" render={<Link href="/learn/profile" />}>
            <User className="size-4 text-muted-foreground" />
            {t('profile.title')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2 px-2 py-1.5"
          onClick={() => signOut()}
        >
          <LogOut className="size-4" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
