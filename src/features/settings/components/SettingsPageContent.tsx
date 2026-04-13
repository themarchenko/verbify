'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { LogoUploadSection } from './LogoUploadSection'
import { SchoolNameForm } from './SchoolNameForm'

interface GeneralSettingsContentProps {
  name: string
  slug: string
  logoUrl: string | null
}

export function GeneralSettingsContent({ name, slug, logoUrl }: GeneralSettingsContentProps) {
  const t = useTranslations('settings')

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <SchoolNameForm initialName={name} slug={slug} />

          <Separator />

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{t('logo')}</h3>
            <LogoUploadSection initialLogoUrl={logoUrl} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
