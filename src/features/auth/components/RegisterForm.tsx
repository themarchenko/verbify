'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { signUp } from '../api/auth.mutations'
import { signInWithProvider } from '../api/auth.oauth'
import { registerSchema } from '../model/auth.schema'

type FieldErrors = { fullName?: string; email?: string; password?: string }

export function RegisterForm() {
  const t = useTranslations()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const parsed = registerSchema.safeParse({ fullName, email, password })
    if (!parsed.success) {
      const errors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (field === 'fullName') errors.fullName = t('auth.validation.nameMin')
        if (field === 'email') errors.email = t('auth.validation.invalidEmail')
        if (field === 'password') errors.password = t('auth.validation.passwordMin')
      }
      setFieldErrors(errors)
      setLoading(false)
      return
    }
    setFieldErrors({})

    const result = await signUp(email, password, fullName)
    if (result?.error) {
      setError(t(`auth.${result.error}`))
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center py-6">
          <p className="text-base text-muted-foreground">{t('auth.checkEmail')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Verbify</h1>
            <p className="text-balance text-muted-foreground">{t('auth.registerSubtitle')}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">{t('auth.fullName')}</Label>
            <Input id="fullName" name="fullName" type="text" />
            {fieldErrors.fullName && (
              <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" />
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.register')}
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              {t('auth.orContinueWith')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signInWithProvider('google')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signInWithProvider('apple')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
            </Button>
          </div>

          <div className="text-center text-sm">
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="underline underline-offset-4">
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
