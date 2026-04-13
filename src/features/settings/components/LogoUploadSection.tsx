'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { GraduationCap, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { removeSchoolLogo, uploadSchoolLogo } from '../api/settings.mutations'
import { LogoCropDialog } from './LogoCropDialog'
import { dispatchSaved } from './SaveIndicator'

interface LogoUploadSectionProps {
  initialLogoUrl: string | null
}

export function LogoUploadSection({ initialLogoUrl }: LogoUploadSectionProps) {
  const t = useTranslations('settings')

  const tErrors = useTranslations('errors')

  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('logoFormats'))
      return
    }

    setCropFile(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleCropped(blob: Blob) {
    setCropFile(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', new File([blob], 'logo.webp', { type: 'image/webp' }))

      const result = await uploadSchoolLogo(formData)

      if (result.error) {
        toast.error(result.error)
      } else if (result.logoUrl) {
        setLogoUrl(result.logoUrl + '?t=' + Date.now())
        dispatchSaved()
      }
    } catch {
      toast.error(tErrors('generic'))
    }

    setUploading(false)
  }

  async function handleRemove() {
    setUploading(true)

    const result = await removeSchoolLogo()

    if (result.error) {
      toast.error(result.error)
    } else {
      setLogoUrl(null)
      dispatchSaved()
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="size-24 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
            <GraduationCap className="size-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" />
              {uploading ? t('logoUploading') : t('logoUpload')}
            </Button>

            {logoUrl && (
              <Button variant="outline" size="sm" disabled={uploading} onClick={handleRemove}>
                <Trash2 className="size-4" />
                {t('logoRemove')}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{t('logoFormats')}</p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {cropFile && (
        <LogoCropDialog
          file={cropFile}
          open={true}
          onClose={() => setCropFile(null)}
          onCropped={handleCropped}
          onError={(msg) => {
            setCropFile(null)
            toast.error(msg)
          }}
        />
      )}
    </div>
  )
}
