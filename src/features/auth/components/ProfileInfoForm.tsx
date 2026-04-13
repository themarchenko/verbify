'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { updateProfile } from '@/features/auth/api/auth.mutations'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { AvatarUploadSection } from './AvatarUploadSection'

interface ProfileInfoFormProps {
  email: string
  fullName: string
  avatarUrl: string | null
}

export function ProfileInfoForm({
  email,
  fullName: initialFullName,
  avatarUrl,
}: ProfileInfoFormProps) {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')

  const [fullName, setFullName] = useState(initialFullName)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const result = await updateProfile(fullName.trim())

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: t('profileSaved') })
    }

    setSaving(false)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <AvatarUploadSection initialAvatarUrl={avatarUrl} />

          <div className="border-t" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('email')}</Label>
              <Input value={email} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('fullName')}</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('fullName')}
              />
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
              {saving ? tCommon('saving') : tCommon('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
