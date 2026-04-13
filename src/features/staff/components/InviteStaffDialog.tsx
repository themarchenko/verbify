'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import type { StaffPermission } from '@/features/auth/types'
import { ALL_PERMISSIONS } from '@/features/auth/types'
import { Eye, EyeOff, Plus, Shuffle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { inviteStaff } from '../api/staff.mutations'

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

const DEFAULT_PERMISSIONS: Record<string, StaffPermission[]> = {
  teacher: ['manage_courses', 'manage_students'],
  manager: ['manage_students'],
}

export function InviteStaffDialog() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'teacher' | 'manager'>('teacher')
  const [permissions, setPermissions] = useState<StaffPermission[]>(DEFAULT_PERMISSIONS.teacher)
  const formRef = useRef<HTMLFormElement>(null)

  function handleOpen() {
    setOpen(true)
    setError(null)
    setShowPassword(false)
    setRole('teacher')
    setPermissions(DEFAULT_PERMISSIONS.teacher)
  }

  function handleRoleChange(newRole: 'teacher' | 'manager') {
    setRole(newRole)
    setPermissions(DEFAULT_PERMISSIONS[newRole])
  }

  function togglePermission(perm: StaffPermission) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  function handleGenerate() {
    const input = formRef.current?.querySelector<HTMLInputElement>('input[name="password"]')
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(input, generatePassword())
      input.dispatchEvent(new Event('input', { bubbles: true }))
      setShowPassword(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const result = await inviteStaff(
      fd.get('email') as string,
      fd.get('fullName') as string,
      fd.get('password') as string,
      role,
      permissions
    )

    if (result?.error) {
      const errorKey = result.error === 'already_exists' ? t('staff.alreadyExists') : result.error
      setError(errorKey)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
  }

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus size={16} className="mr-2" />
        {t('staff.invite')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('staff.invite')}</DialogTitle>
            <DialogDescription>{t('staff.inviteDesc')}</DialogDescription>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-name">{t('auth.fullName')}</Label>
              <Input
                id="staff-name"
                name="fullName"
                placeholder={t('staff.namePlaceholder')}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-email">{t('auth.email')}</Label>
              <Input
                id="staff-email"
                name="email"
                type="email"
                placeholder={t('staff.emailPlaceholder')}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-password">{t('auth.password')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="staff-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('staff.passwordPlaceholder')}
                    required
                    minLength={6}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleGenerate}>
                  <Shuffle size={16} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('staff.role')}</Label>
              <Select
                value={role}
                onValueChange={(v) => handleRoleChange(v as 'teacher' | 'manager')}
              >
                <SelectTrigger>
                  <SelectValue>
                    {() => (role === 'teacher' ? t('staff.roleTeacher') : t('staff.roleManager'))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher" label={t('staff.roleTeacher')}>
                    {t('staff.roleTeacher')}
                  </SelectItem>
                  <SelectItem value="manager" label={t('staff.roleManager')}>
                    {t('staff.roleManager')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('staff.permissions')}</Label>
              <div className="flex flex-col gap-1.5 rounded-lg border p-3">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="size-4 rounded border-input accent-foreground"
                    />
                    <span className="text-sm">{t(`staff.perm_${perm}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? t('common.loading') : t('staff.invite')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
