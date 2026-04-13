export const COLOR_SCHEMES = {
  default: { primary: '#18181b', accent: '#f4f4f5' },
  ocean: { primary: '#0369a1', accent: '#e0f2fe' },
  forest: { primary: '#15803d', accent: '#f0fdf4' },
  sunset: { primary: '#c2410c', accent: '#fff7ed' },
  violet: { primary: '#7c3aed', accent: '#f5f3ff' },
  rose: { primary: '#be123c', accent: '#fff1f2' },
  amber: { primary: '#b45309', accent: '#fffbeb' },
  slate: { primary: '#334155', accent: '#f8fafc' },
} as const

export type ColorSchemeKey = keyof typeof COLOR_SCHEMES

export function getContrastForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#09090b' : '#fafafa'
}

// Generate a light accent background from a hex color
export function generateAccentFromHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Mix 90% white + 10% color for a soft tint
  const lr = Math.round(255 * 0.9 + r * 0.1)
  const lg = Math.round(255 * 0.9 + g * 0.1)
  const lb = Math.round(255 * 0.9 + b * 0.1)
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
}

// Resolve color scheme + optional custom hex into primary/accent pair
export function resolveSchemeColors(
  colorScheme: string | null,
  primaryColor: string | null
): { primary: string; accent: string } {
  if (colorScheme === 'custom' && primaryColor && /^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
    return { primary: primaryColor, accent: generateAccentFromHex(primaryColor) }
  }
  return COLOR_SCHEMES[(colorScheme as ColorSchemeKey) ?? 'default'] ?? COLOR_SCHEMES.default
}

// Generate 4 shades for pixel background animation from a hex color
export function generatePixelColors(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const darken = (factor: number) => {
    const dr = Math.round(r * factor)
    const dg = Math.round(g * factor)
    const db = Math.round(b * factor)
    return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
  }
  return [hex, darken(0.85), darken(0.7), darken(0.55)].join(',')
}

// Build CSS variable overrides for the theme
export function buildThemeVars(
  colorScheme: string | null,
  primaryColor: string | null
): React.CSSProperties {
  const scheme = resolveSchemeColors(colorScheme, primaryColor)
  return {
    '--primary': scheme.primary,
    '--primary-foreground': getContrastForeground(scheme.primary),
    '--ring': scheme.primary,
    '--accent': scheme.accent,
    '--sidebar-primary': scheme.primary,
    '--sidebar-primary-foreground': getContrastForeground(scheme.primary),
  } as React.CSSProperties
}
