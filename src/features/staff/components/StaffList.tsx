'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import type { StaffPermission } from '@/features/auth/types'
import { ALL_PERMISSIONS } from '@/features/auth/types'
import { Crown, Loader2, MoreVertical, Pencil, Shield, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { removeStaffMember, updateStaffMember } from '../api/staff.mutations'
import type { StaffRow } from '../api/staff.queries'
import { InviteStaffDialog } from './InviteStaffDialog'

interface StaffListProps {
  staff: StaffRow[]
  currentUserId: string
}

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations('staff')

  if (role === 'owner') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
        <Crown size={12} />
        {t('roleOwner')}
      </span>
    )
  }

  if (role === 'manager') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
        <Shield size={12} />
        {t('roleManager')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
      {t('roleTeacher')}
    </span>
  )
}

export function StaffList({ staff, currentUserId }: StaffListProps) {
  const t = useTranslations('staff')
  const tc = useTranslations('common')
  const tAuth = useTranslations('auth')
  const [confirm, confirmDialog] = useConfirm()
  const [isPending, startTransition] = useTransition()

  const [editingMember, setEditingMember] = useState<StaffRow | null>(null)
  const [editRole, setEditRole] = useState<'teacher' | 'manager'>('teacher')
  const [editPermissions, setEditPermissions] = useState<StaffPermission[]>([])
  const [editName, setEditName] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  function handleEditOpen(member: StaffRow) {
    setEditingMember(member)
    setEditRole(member.role as 'teacher' | 'manager')
    setEditPermissions(member.permissions as StaffPermission[])
    setEditName(member.full_name || '')
  }

  function toggleEditPermission(perm: StaffPermission) {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingMember) return
    setEditLoading(true)

    await updateStaffMember(editingMember.id, {
      fullName: editName,
      role: editRole,
      permissions: editPermissions,
    })

    setEditingMember(null)
    setEditLoading(false)
  }

  async function handleRemove(member: StaffRow) {
    const ok = await confirm({
      title: t('removeMember'),
      description: t('removeConfirm', { name: member.full_name || t('unnamed') }),
      confirmLabel: tc('delete'),
      cancelLabel: tc('cancel'),
      variant: 'destructive',
    })
    if (!ok) return
    startTransition(async () => {
      await removeStaffMember(member.id)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <InviteStaffDialog />
      </div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-medium">{t('noStaff')}</p>
          <p className="text-base text-muted-foreground mt-1">{t('noStaffDesc')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {staff.map((member) => {
            const isOwner = member.role === 'owner'
            const isSelf = member.user_id === currentUserId

            return (
              <div
                key={member.id}
                className="group flex items-center gap-3 border rounded-xl p-4 bg-white hover:border-foreground/20 hover:shadow-sm transition-all"
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name || ''}
                    className="size-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="size-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                    style={{ background: 'var(--surface-3)' }}
                  >
                    {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium truncate">
                      {member.full_name || t('unnamed')}
                    </p>
                    <RoleBadge role={member.role} />
                  </div>
                  {!isOwner && member.permissions.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {member.permissions.map((p) => t(`perm_${p}`)).join(', ')}
                    </p>
                  )}
                </div>

                {!isOwner && !isSelf && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all cursor-pointer shrink-0">
                      <MoreVertical size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleEditOpen(member)}>
                        <Pencil size={14} className="mr-2 shrink-0" />
                        {t('editMember')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemove(member)}
                      >
                        <Trash2 size={14} className="mr-2 shrink-0" />
                        {t('removeMember')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editMember')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-staff-name">{tAuth('fullName')}</Label>
              <Input
                id="edit-staff-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('role')}</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as 'teacher' | 'manager')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher" label={t('roleTeacher')}>
                    {t('roleTeacher')}
                  </SelectItem>
                  <SelectItem value="manager" label={t('roleManager')}>
                    {t('roleManager')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('permissions')}</Label>
              <div className="flex flex-col gap-1.5 rounded-lg border p-3">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(perm)}
                      onChange={() => toggleEditPermission(perm)}
                      className="size-4 rounded border-input accent-foreground"
                    />
                    <span className="text-sm">{t(`perm_${perm}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={editLoading} className="w-full sm:w-auto">
                {editLoading ? tc('loading') : tc('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  )
}
