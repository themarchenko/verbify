import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function TermsNotice() {
  const t = useTranslations('auth')

  return (
    <p className="text-balance text-center text-xs text-muted-foreground mt-4 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
      {t.rich('termsNotice', {
        terms: (chunks) => <Link href="/terms">{chunks}</Link>,
        privacy: (chunks) => <Link href="/privacy">{chunks}</Link>,
      })}
    </p>
  )
}
