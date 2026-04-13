'use client'

import * as React from 'react'

import { getRandomUnsplashPhoto } from '@/shared/api/unsplash.actions'
import { cn } from '@/shared/lib/utils'

type UnsplashBackgroundProps = {
  className?: string
  interval?: number
  children?: React.ReactNode
}

function UnsplashBackground({ className, interval = 60000, children }: UnsplashBackgroundProps) {
  const [images, setImages] = React.useState<[string, string]>(['', ''])
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeRef = React.useRef(0)

  React.useEffect(() => {
    let cancelled = false

    async function loadInitial() {
      const url = await getRandomUnsplashPhoto()
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
      const url = await getRandomUnsplashPhoto()
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
