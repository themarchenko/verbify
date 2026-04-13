'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateSchoolName } from '../api/settings.mutations'
import { dispatchSaved } from './SaveIndicator'

interface SchoolNameFormProps {
  initialName: string
  slug: string
}

export function SchoolNameForm({ initialName, slug }: SchoolNameFormProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const result = await updateSchoolName(name.trim())

    if (result.error) {
      setError(result.error)
    } else {
      dispatchSaved()
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>{t('schoolName')}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('schoolName')}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('schoolSlug')}</Label>
        <Input value={slug} disabled />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="self-start" disabled={saving}>
        {saving ? tCommon('saving') : tCommon('save')}
      </Button>
    </form>
  )
}
