import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function PrivacyPage() {
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

        <h1 className="mt-8 text-3xl font-bold tracking-tight">{t('privacyTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('lastUpdated')}</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('privacySection1Title')}
            </h2>
            <p>{t('privacySection1Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('privacySection2Title')}
            </h2>
            <p>{t('privacySection2Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('privacySection3Title')}
            </h2>
            <p>{t('privacySection3Body')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {t('privacySection4Title')}
            </h2>
            <p>{t('privacySection4Body')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
