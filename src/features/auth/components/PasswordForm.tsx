'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { changePassword } from '@/features/auth/api/auth.mutations'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FieldErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-sm">
      {met ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={met ? 'text-emerald-600' : 'text-muted-foreground'}>{label}</span>
    </li>
  )
}

export function PasswordForm() {
  const t = useTranslations('profile')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [newPasswordFocused, setNewPasswordFocused] = useState(false)

  function validateField(
    field: keyof FieldErrors,
    values: { currentPassword: string; newPassword: string; confirmPassword: string }
  ): string | undefined {
    switch (field) {
      case 'currentPassword':
        if (!values.currentPassword) return t('currentPasswordRequired')
        return undefined
      case 'newPassword':
        if (!values.newPassword) return t('newPasswordRequired')
        if (values.newPassword.length < 6) return t('passwordTooShort')
        return undefined
      case 'confirmPassword':
        if (!values.confirmPassword) return t('confirmPasswordRequired')
        if (values.confirmPassword !== values.newPassword) return t('passwordMismatch')
        return undefined
    }
  }

  function updateFieldError(field: keyof FieldErrors, values: typeof currentValues) {
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, values) }))
  }

  const currentValues = { currentPassword, newPassword, confirmPassword }

  function handleBlur(field: keyof FieldErrors) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    updateFieldError(field, currentValues)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const allTouched = { currentPassword: true, newPassword: true, confirmPassword: true }
    setTouched(allTouched)

    const errors: FieldErrors = {
      currentPassword: validateField('currentPassword', currentValues),
      newPassword: validateField('newPassword', currentValues),
      confirmPassword: validateField('confirmPassword', currentValues),
    }

    const hasErrors = Object.values(errors).some(Boolean)
    setFieldErrors(errors)
    if (hasErrors) return

    setSaving(true)
    setMessage(null)

    const result = await changePassword(currentPassword, newPassword)

    if (result.error) {
      const text = result.error === 'incorrectPassword' ? t('incorrectPassword') : result.error
      setMessage({ type: 'error', text })
    } else {
      setMessage({ type: 'success', text: t('passwordChanged') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFieldErrors({})
      setTouched({})
      setNewPasswordFocused(false)
    }

    setSaving(false)
  }

  const showRequirements = newPasswordFocused || touched.newPassword

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('currentPassword')}</Label>
              <Input
                type="password"
                value={currentPassword}
                aria-invalid={!!fieldErrors.currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setMessage(null)
                  if (touched.currentPassword) {
                    const values = { ...currentValues, currentPassword: e.target.value }
                    setFieldErrors((prev) => ({
                      ...prev,
                      currentPassword: validateField('currentPassword', values),
                    }))
                  }
                }}
                onBlur={() => handleBlur('currentPassword')}
              />
              {fieldErrors.currentPassword && (
                <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('newPassword')}</Label>
              <Input
                type="password"
                value={newPassword}
                aria-invalid={!!fieldErrors.newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setMessage(null)
                  if (touched.newPassword) {
                    const values = { ...currentValues, newPassword: e.target.value }
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: validateField('newPassword', values),
                    }))
                  }
                  if (touched.confirmPassword) {
                    const values = { ...currentValues, newPassword: e.target.value }
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateField('confirmPassword', values),
                    }))
                  }
                }}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={() => {
                  setNewPasswordFocused(false)
                  handleBlur('newPassword')
                }}
              />
              {fieldErrors.newPassword && (
                <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>
              )}
              {showRequirements && (
                <ul className="mt-0.5 space-y-1">
                  <PasswordRequirement met={newPassword.length >= 6} label={t('reqMinLength')} />
                  {touched.confirmPassword && confirmPassword.length > 0 && (
                    <PasswordRequirement
                      met={newPassword === confirmPassword}
                      label={t('reqMatch')}
                    />
                  )}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('confirmPassword')}</Label>
              <Input
                type="password"
                value={confirmPassword}
                aria-invalid={!!fieldErrors.confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setMessage(null)
                  if (touched.confirmPassword) {
                    const values = { ...currentValues, confirmPassword: e.target.value }
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateField('confirmPassword', values),
                    }))
                  }
                }}
                onBlur={() => handleBlur('confirmPassword')}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {message && (
              <p
                className={
                  message.type === 'error'
                    ? 'text-sm text-destructive'
                    : 'text-sm text-muted-foreground'
                }
              >
                {message.text}
              </p>
            )}

            <Button type="submit" className="self-start" disabled={saving}>
              {t('updatePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
