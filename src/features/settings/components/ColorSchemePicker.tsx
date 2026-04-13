'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'

import { Check, Pipette } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
  initialCustomColor: string
}

export function ColorSchemePicker({ initialScheme, initialCustomColor }: ColorSchemePickerProps) {
  const t = useTranslations('settings')

  const [selected, setSelected] = useState(initialScheme)
  const [saving, setSaving] = useState<string | null>(null)
  const [customColor, setCustomColor] = useState(initialCustomColor)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const save = useCallback(
    async (scheme: string, hex?: string) => {
      setSaving(scheme)
      const result = await updateColorScheme(scheme, hex)
      if (!result.error) {
        setSelected(scheme)
        dispatchSaved()
      }
      setSaving(null)
    },
    []
  )

  async function handleSelect(key: string) {
    if (key === selected && key !== 'custom') return
    await save(key)
  }

  function handleCustomColorChange(hex: string) {
    setCustomColor(hex)
    setSelected('custom')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      save('custom', hex)
    }, 400)
  }

  function handleHexInput(value: string) {
    const cleaned = value.startsWith('#') ? value : `#${value}`
    if (/^#[0-9a-fA-F]{0,6}$/.test(cleaned)) {
      setCustomColor(cleaned)
      setSelected('custom')
      if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          save('custom', cleaned)
        }, 400)
      }
    }
  }

  const isCustom = selected === 'custom'

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

        {/* Custom color option */}
        <Popover>
          <PopoverTrigger
            className="group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            style={{
              borderColor: isCustom ? customColor : undefined,
              borderWidth: isCustom ? 2 : undefined,
            }}
          >
            <div
              className="flex size-10 items-center justify-center rounded-full"
              style={{
                background: isCustom
                  ? customColor
                  : 'conic-gradient(from 0deg, #f44, #f90, #ff0, #3c0, #09f, #63f, #f44)',
              }}
            >
              {isCustom ? (
                <Check className="size-5 text-white" />
              ) : (
                <Pipette className="size-5 text-white drop-shadow-sm" />
              )}
            </div>
            <span className="text-xs font-medium">{t('schemeCustom')}</span>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="center" sideOffset={8}>
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">{t('customColorLabel')}</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative size-10 shrink-0 overflow-hidden rounded-lg border-2 border-border"
                  style={{ backgroundColor: customColor }}
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </button>
                <Input
                  value={customColor}
                  onChange={(e) => handleHexInput(e.target.value)}
                  placeholder="#6366f1"
                  className="font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
              {saving === 'custom' && (
                <p className="text-xs text-muted-foreground">{t('saving')}</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
