'use client'

import type { StaffPermission, UserRole } from '@/features/auth/types'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AppSidebar } from './Sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  schoolName: string
  schoolLogoUrl: string | null
  userRole: UserRole
  userName: string | null
  userPermissions: StaffPermission[]
  userAvatarUrl: string | null
  headerSlot?: React.ReactNode
}

export function DashboardShell({
  children,
  schoolName,
  schoolLogoUrl,
  userRole,
  userName,
  userPermissions,
  userAvatarUrl,
  headerSlot,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        schoolName={schoolName}
        schoolLogoUrl={schoolLogoUrl}
        userRole={userRole}
        userName={userName}
        userPermissions={userPermissions}
        userAvatarUrl={userAvatarUrl}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          {headerSlot && <div className="flex items-center gap-2">{headerSlot}</div>}
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
