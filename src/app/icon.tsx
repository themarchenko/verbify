import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'

import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 32, height: 32 }

export default async function Icon() {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? ''
  const hostname = host.split(':')[0]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: school } = await supabase
    .from('schools')
    .select('logo_url')
    .eq('custom_domain', hostname)
    .single()

  const logoUrl =
    school?.logo_url ??
    (
      await supabase.from('schools').select('logo_url').limit(1).single()
    ).data?.logo_url

  if (logoUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="" width={32} height={32} style={{ objectFit: 'contain' }} />
        </div>
      ),
      { ...size }
    )
  }

  // Fallback: "V" letter
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
        V
      </div>
    ),
    { ...size }
  )
}
