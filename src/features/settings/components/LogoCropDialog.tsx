'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { cropImage } from '../model/crop-image'

function getInitialCrop(width: number, height: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height)
}

interface LogoCropDialogProps {
  file: File
  open: boolean
  onClose: () => void
  onCropped: (blob: Blob) => void
  onError: (message: string) => void
}

export function LogoCropDialog({ file, open, onClose, onCropped, onError }: LogoCropDialogProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgSrc] = useState(() => URL.createObjectURL(file))
  const [cropping, setCropping] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = getInitialCrop(width, height)
    setCrop(initialCrop)
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height))
  }, [])

  async function handleConfirm() {
    if (!imgRef.current || !completedCrop) return

    setCropping(true)
    try {
      const blob = await cropImage(imgRef.current, completedCrop, 256)
      onCropped(blob)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Crop failed')
      onClose()
    }
    setCropping(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('logoCropTitle')}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop={false}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop"
              onLoad={onImageLoad}
              style={{ maxHeight: 400, maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={cropping}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={cropping || !completedCrop}>
            {cropping ? tCommon('saving') : tCommon('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
