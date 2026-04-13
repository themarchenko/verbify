'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateCustomDomain } from '../api/settings.mutations'
import { dispatchSaved } from './SaveIndicator'

interface CustomDomainFormProps {
  initialDomain: string | null
}

export function CustomDomainForm({ initialDomain }: CustomDomainFormProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const [domain, setDomain] = useState(initialDomain ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedDomain, setSavedDomain] = useState(initialDomain)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const value = domain.trim() || null
    const result = await updateCustomDomain(value)

    if (result.error) {
      setError(result.error)
    } else {
      setSavedDomain(value)
      dispatchSaved()
    }

    setSaving(false)
  }

  async function handleRemove() {
    setSaving(true)
    setError(null)

    const result = await updateCustomDomain(null)

    if (result.error) {
      setError(result.error)
    } else {
      setDomain('')
      setSavedDomain(null)
      dispatchSaved()
    }

    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>{t('customDomain')}</Label>
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder={t('customDomainPlaceholder')}
          />
          <p className="text-sm text-muted-foreground">{t('customDomainHelp')}</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" className="self-start" disabled={saving}>
            {saving ? tCommon('saving') : tCommon('save')}
          </Button>

          {savedDomain && (
            <Button
              type="button"
              variant="outline"
              className="self-start"
              disabled={saving}
              onClick={handleRemove}
            >
              {t('customDomainRemove')}
            </Button>
          )}
        </div>
      </form>

      {savedDomain && (
        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">{t('dnsInstructions')}</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-muted-foreground">{t('dnsType')}</span>
            <span className="text-muted-foreground">{t('dnsName')}</span>
            <span className="text-muted-foreground">{t('dnsValue')}</span>
            <span className="font-mono">CNAME</span>
            <span className="font-mono">{savedDomain}</span>
            <span className="font-mono">verbify.app</span>
          </div>
        </div>
      )}
    </div>
  )
}
