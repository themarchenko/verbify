import { z } from 'zod/v4'

import { COLOR_SCHEMES } from './color-schemes.config'

export const updateSchoolNameSchema = z.object({
  name: z.string().min(2).max(100),
})

const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/

export const updateCustomDomainSchema = z.object({
  customDomain: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().regex(domainRegex))
    .nullable(),
})

const schemeKeys = Object.keys(COLOR_SCHEMES) as [string, ...string[]]

export const updateColorSchemeSchema = z.object({
  colorScheme: z.enum(schemeKeys),
})
