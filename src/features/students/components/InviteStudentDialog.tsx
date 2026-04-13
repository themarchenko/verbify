'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

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

import { inviteStudent } from '../api/students.mutations'

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export function InviteStudentDialog() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function handleOpen() {
    setOpen(true)
    setError(null)
    setShowPassword(false)
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
    const result = await inviteStudent(
      fd.get('email') as string,
      fd.get('fullName') as string,
      fd.get('password') as string
    )

    if (result?.error) {
      setError(result.error)
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
        {t('students.invite')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('students.invite')}</DialogTitle>
            <DialogDescription>{t('students.inviteDesc')}</DialogDescription>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">{t('auth.fullName')}</Label>
              <Input
                id="invite-name"
                name="fullName"
                placeholder={t('students.namePlaceholder')}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">{t('auth.email')}</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder={t('students.emailPlaceholder')}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-password">{t('auth.password')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="invite-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('students.passwordPlaceholder')}
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
              <p className="text-xs text-muted-foreground">{t('students.passwordHint')}</p>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? t('common.loading') : t('students.invite')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
