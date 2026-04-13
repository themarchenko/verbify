import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'

import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'
export const size = { width: 32, height: 32 }

async function getSchoolLogo() {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? ''
  const hostname = host.split(':')[0]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: school } = await supabase
    .from('schools')
    .select('name, logo_url')
    .eq('custom_domain', hostname)
    .single()

  if (school) return school

  const { data: fallback } = await supabase
    .from('schools')
    .select('name, logo_url')
    .limit(1)
    .single()

  return fallback
}

export default async function Icon() {
  const school = await getSchoolLogo()
  const logoUrl = school?.logo_url

  if (logoUrl) {
    // Proxy the image directly — ImageResponse/Satori can't handle webp
    const res = await fetch(logoUrl)
    if (res.ok) {
      return new Response(await res.arrayBuffer(), {
        headers: {
          'Content-Type': res.headers.get('content-type') ?? 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  }

  // Fallback: first letter of school name, or "V"
  const letter = school?.name?.[0]?.toUpperCase() ?? 'V'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '22px',
          fontWeight: 700,
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  )
}
