'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { signOut } from '@/features/auth/api/auth.mutations'
import type { StaffPermission, UserRole } from '@/features/auth/types'
import {
  BookOpen,
  Calendar,
  ChevronsUpDown,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  UserCog,
  Users,
} from 'lucide-react'

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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['owner', 'teacher', 'manager'],
  },
  { key: 'courses', href: '/dashboard/courses', icon: BookOpen, roles: ['owner', 'teacher'] },
  {
    key: 'schedule',
    href: '/dashboard/schedule',
    icon: Calendar,
    roles: ['owner', 'teacher'],
  },
  {
    key: 'students',
    href: '/dashboard/students',
    icon: Users,
    roles: ['owner', 'teacher', 'manager'],
  },
  { key: 'staff', href: '/dashboard/staff', icon: UserCog, roles: ['owner'] },
  { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ['owner'] },
] as const

interface SidebarProps {
  schoolName: string
  schoolLogoUrl: string | null
  userRole: UserRole
  userName: string | null
  userPermissions: StaffPermission[]
  userAvatarUrl: string | null
}

export function AppSidebar({
  schoolName,
  schoolLogoUrl,
  userRole,
  userName,
  userPermissions,
  userAvatarUrl,
}: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations()

  const filteredItems = navItems.filter((item) =>
    (item.roles as readonly string[]).includes(userRole)
  )

  const canAccessSettings = userRole === 'owner' || userPermissions.includes('manage_settings')
  const canAccessBilling = userRole === 'owner' || userPermissions.includes('manage_billing')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              {schoolLogoUrl ? (
                <img
                  src={schoolLogoUrl}
                  alt={schoolName}
                  className="aspect-square size-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
              )}
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-semibold">{schoolName}</span>
                <span className="truncate text-sm capitalize">{userRole}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.platform')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={t(`nav.${item.key}`)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{t(`nav.${item.key}`)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 text-left text-base outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground">
                <Avatar className="size-8 shrink-0 rounded-lg">
                  {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName || ''} />}
                  <AvatarFallback className="rounded-lg">
                    {userName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-base leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-sm capitalize text-muted-foreground">
                    {userRole}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={4}
                className="min-w-56 rounded-xl"
              >
                <div className="flex items-center gap-3 px-2 py-2.5">
                  <Avatar className="size-10 rounded-lg">
                    {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName || ''} />}
                    <AvatarFallback className="rounded-lg bg-foreground text-background text-sm font-medium">
                      {userName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">{userName}</span>
                    <Badge
                      variant="secondary"
                      className="mt-0.5 w-fit px-1.5 py-0 text-[10px] capitalize"
                    >
                      {userRole}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('profile.account')}</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="gap-2 px-2 py-1.5"
                    render={<Link href="/dashboard/profile" />}
                  >
                    <User className="size-4 text-muted-foreground" />
                    {t('profile.title')}
                  </DropdownMenuItem>
                  {canAccessSettings && (
                    <DropdownMenuItem
                      className="gap-2 px-2 py-1.5"
                      render={<Link href="/dashboard/settings" />}
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      {t('profile.schoolSettings')}
                    </DropdownMenuItem>
                  )}
                  {canAccessBilling && (
                    <DropdownMenuItem
                      className="gap-2 px-2 py-1.5"
                      render={<Link href="/dashboard/settings/billing" />}
                    >
                      <CreditCard className="size-4 text-muted-foreground" />
                      {t('profile.subscription')}
                    </DropdownMenuItem>
                  )}
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
