'use client'

import { Card, CardContent } from '@/components/ui/card'

import { CustomDomainForm } from './CustomDomainForm'

interface DomainSettingsContentProps {
  customDomain: string | null
}

export function DomainSettingsContent({ customDomain }: DomainSettingsContentProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <CustomDomainForm initialDomain={customDomain} />
        </CardContent>
      </Card>
    </div>
  )
}
