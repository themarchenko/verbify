import { LoginForm } from '@/features/auth'
import { getSchoolLoginBranding } from '@/features/auth/api/auth.queries'
import { TermsNotice } from '@/features/auth/components/TermsNotice'

import { Card, CardContent } from '@/components/ui/card'
import { PixelBackground } from '@/components/ui/pixel-background'
import { UnsplashBackground } from '@/components/ui/unsplash-background'

export default async function LoginPage() {
  const branding = await getSchoolLoginBranding()

  return (
    <UnsplashBackground
      className="flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-10"
    >
      <div className="w-full max-w-[480px] md:max-w-8xl">
        <Card className="overflow-hidden py-0 border-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <LoginForm />
            <PixelBackground
              pattern="diagonal"
              speed={40}
              gap={6}
              colors="#18181b,#27272a,#3f3f46,#52525b"
              className="relative hidden bg-zinc-900 md:flex md:items-center md:justify-center min-h-[540px]"
            >
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {branding.loginHeading}
                </span>
                {branding.loginSubheading && (
                  <span className="text-sm text-zinc-400">{branding.loginSubheading}</span>
                )}
              </div>
            </PixelBackground>
          </CardContent>
        </Card>
        <TermsNotice />
      </div>
    </UnsplashBackground>
  )
}
