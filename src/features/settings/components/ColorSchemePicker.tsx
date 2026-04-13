'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Check } from 'lucide-react'

import { updateColorScheme } from '../api/settings.mutations'
import { COLOR_SCHEMES, type ColorSchemeKey } from '../model/color-schemes.config'
import { dispatchSaved } from './SaveIndicator'

const SCHEME_I18N_KEYS: Record<ColorSchemeKey, string> = {
  default: 'schemeDefault',
  ocean: 'schemeOcean',
  forest: 'schemeForest',
  sunset: 'schemeSunset',
  violet: 'schemeViolet',
  rose: 'schemeRose',
  amber: 'schemeAmber',
  slate: 'schemeSlate',
}

interface ColorSchemePickerProps {
  initialScheme: string
}

export function ColorSchemePicker({ initialScheme }: ColorSchemePickerProps) {
  const t = useTranslations('settings')

  const [selected, setSelected] = useState(initialScheme)
  const [saving, setSaving] = useState<string | null>(null)

  async function handleSelect(key: string) {
    if (key === selected) return

    setSaving(key)
    const result = await updateColorScheme(key)

    if (!result.error) {
      setSelected(key)
      dispatchSaved()
    }

    setSaving(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t('colorSchemeDescription')}</p>

      <div className="grid grid-cols-4 gap-3">
        {(Object.keys(COLOR_SCHEMES) as ColorSchemeKey[]).map((key) => {
          const scheme = COLOR_SCHEMES[key]
          const isActive = selected === key
          const isSaving = saving === key

          return (
            <button
              key={key}
              type="button"
              disabled={isSaving}
              onClick={() => handleSelect(key)}
              className="group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              style={{
                borderColor: isActive ? scheme.primary : undefined,
                borderWidth: isActive ? 2 : undefined,
              }}
            >
              <div
                className="flex size-10 items-center justify-center rounded-full"
                style={{ backgroundColor: scheme.primary }}
              >
                {isActive && <Check className="size-5" style={{ color: scheme.accent }} />}
              </div>
              <span className="text-xs font-medium">{t(SCHEME_I18N_KEYS[key])}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
