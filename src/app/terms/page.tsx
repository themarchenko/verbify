import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function TermsPage() {
  const t = useTranslations('legal')

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          &larr; {t('backToLogin')}
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">{t('termsTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('lastUpdated')}</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('termsSection1Title')}
            </h2>
            <p>{t('termsSection1Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('termsSection2Title')}
            </h2>
            <p>{t('termsSection2Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('termsSection3Title')}
            </h2>
            <p>{t('termsSection3Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('termsSection4Title')}
            </h2>
            <p>{t('termsSection4Body')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
