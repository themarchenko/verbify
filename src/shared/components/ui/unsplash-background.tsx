'use client'

import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const UNSPLASH_QUERIES = [
  'ocean waves',
  'underwater coral reef',
  'coastal cliffs',
  'tropical beach',
  'deep sea',
  'sailing boat ocean',
  'lighthouse sea',
]

async function fetchRandomPhoto(): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!accessKey) return null

  const query = UNSPLASH_QUERIES[Math.floor(Math.random() * UNSPLASH_QUERIES.length)]

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&w=1920`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.urls?.regular || null
  } catch {
    return null
  }
}

type UnsplashBackgroundProps = {
  className?: string
  interval?: number
  children?: React.ReactNode
}

function UnsplashBackground({ className, interval = 12000, children }: UnsplashBackgroundProps) {
  const [images, setImages] = React.useState<[string, string]>(['', ''])
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeRef = React.useRef(0)

  React.useEffect(() => {
    let cancelled = false

    async function loadInitial() {
      const url = await fetchRandomPhoto()
      if (!cancelled && url) {
        const img = new Image()
        img.onload = () => {
          if (!cancelled) setImages([url, ''])
        }
        img.src = url
      }
    }
    loadInitial()

    const timer = setInterval(async () => {
      const url = await fetchRandomPhoto()
      if (cancelled || !url) return

      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        const nextIdx = activeRef.current === 0 ? 1 : 0
        setImages((prev) => {
          const next: [string, string] = [...prev]
          next[nextIdx] = url
          return next
        })
        activeRef.current = nextIdx
        setActiveIndex(nextIdx)
      }
      img.src = url
    }, interval)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [interval])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {images.map((src, i) =>
        src ? (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1500 ease-in-out"
            style={{ opacity: activeIndex === i ? 1 : 0 }}
          />
        ) : null
      )}
      <div className="absolute inset-0 bg-black/30" />
      {children && <div className="relative z-[1]">{children}</div>}
    </div>
  )
}

export { UnsplashBackground, type UnsplashBackgroundProps }
