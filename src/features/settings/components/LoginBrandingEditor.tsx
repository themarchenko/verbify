'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateLoginBranding } from '../api/settings.mutations'

interface LoginBrandingEditorProps {
  initialHeading: string
  initialSubheading: string
}

export function LoginBrandingEditor({
  initialHeading,
  initialSubheading,
}: LoginBrandingEditorProps) {
  const t = useTranslations('settings')
  const [heading, setHeading] = useState(initialHeading)
  const [subheading, setSubheading] = useState(initialSubheading)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    startTransition(async () => {
      const result = await updateLoginBranding(heading, subheading)
      if (!result.error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium">{t('loginBranding')}</h3>
        <p className="text-sm text-muted-foreground">{t('loginBrandingDesc')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-heading">{t('loginHeading')}</Label>
          <Input
            id="login-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder={t('loginHeadingPlaceholder')}
            maxLength={60}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-subheading">{t('loginSubheading')}</Label>
          <Input
            id="login-subheading"
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            placeholder={t('loginSubheadingPlaceholder')}
            maxLength={120}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? t('saving') : t('saveSettings')}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">{t('saved')}</span>}
      </div>
    </div>
  )
}
