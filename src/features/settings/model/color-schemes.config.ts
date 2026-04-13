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
  // Relative luminance (sRGB)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#09090b' : '#fafafa'
}
