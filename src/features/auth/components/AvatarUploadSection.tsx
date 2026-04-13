'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { LogoCropDialog } from '@/features/settings/components/LogoCropDialog'
import { Trash2, Upload, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { removeAvatar, uploadAvatar } from '../api/auth.mutations'

interface AvatarUploadSectionProps {
  initialAvatarUrl: string | null
}

export function AvatarUploadSection({ initialAvatarUrl }: AvatarUploadSectionProps) {
  const t = useTranslations('profile')
  const tErrors = useTranslations('errors')

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('avatarFormats'))
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
      formData.append('file', new File([blob], 'avatar.webp', { type: 'image/webp' }))

      const result = await uploadAvatar(formData)

      if (result.error) {
        toast.error(result.error)
      } else if (result.avatarUrl) {
        setAvatarUrl(result.avatarUrl + '?t=' + Date.now())
      }
    } catch {
      toast.error(tErrors('generic'))
    }

    setUploading(false)
  }

  async function handleRemove() {
    setUploading(true)

    const result = await removeAvatar()

    if (result.error) {
      toast.error(result.error)
    } else {
      setAvatarUrl(null)
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="size-24 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full bg-muted ring-1 ring-border">
            <User className="size-8 text-muted-foreground" />
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
              {uploading ? t('avatarUploading') : t('avatarUpload')}
            </Button>

            {avatarUrl && (
              <Button variant="outline" size="sm" disabled={uploading} onClick={handleRemove}>
                <Trash2 className="size-4" />
                {t('avatarRemove')}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{t('avatarFormats')}</p>
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
