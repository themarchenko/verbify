'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { ColorSchemePicker } from './ColorSchemePicker'
import { LoginBrandingEditor } from './LoginBrandingEditor'

interface BrandingSettingsContentProps {
  colorScheme: string | null
  loginHeading: string | null
  loginSubheading: string | null
}

export function BrandingSettingsContent({
  colorScheme,
  loginHeading,
  loginSubheading,
}: BrandingSettingsContentProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <ColorSchemePicker initialScheme={colorScheme ?? 'default'} />
          <Separator />
          <LoginBrandingEditor
            initialHeading={loginHeading ?? ''}
            initialSubheading={loginSubheading ?? ''}
          />
        </CardContent>
      </Card>
    </div>
  )
}
