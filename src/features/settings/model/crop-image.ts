import type { PixelCrop } from 'react-image-crop'

export function cropImage(image: HTMLImageElement, crop: PixelCrop, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    size,
    size
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/webp',
      0.85
    )
  })
}
