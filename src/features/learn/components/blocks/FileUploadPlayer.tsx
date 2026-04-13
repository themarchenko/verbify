'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { uploadHomeworkFile } from '@/features/homework/api/file.mutations'
import { saveFileUploadProgress } from '@/features/homework/api/homework.mutations'
import { FileIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface UploadedFile {
  name: string
  url: string
  size: number
}

interface FileUploadPlayerProps {
  content: {
    prompt: string
    allowed_extensions?: string[]
    max_file_size_mb?: number
    max_files?: number
  }
  blockId: string
  lessonId: string
  onComplete: () => void
  readOnly?: boolean
  initialFiles?: UploadedFile[]
  teacherFeedback?: string
}

export function FileUploadPlayer({
  content,
  blockId,
  lessonId,
  onComplete,
  readOnly,
  initialFiles,
  teacherFeedback,
}: FileUploadPlayerProps) {
  const t = useTranslations('homework')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles || [])
  const [uploading, setUploading] = useState(false)

  const maxFiles = content.max_files || 1
  const maxSizeMb = content.max_file_size_mb || 10
  const extensions = content.allowed_extensions || []

  const accept = extensions.length > 0 ? extensions.map((e) => `.${e}`).join(',') : undefined

  async function handleFileSelect(file: File) {
    if (uploading || readOnly) return
    if (files.length >= maxFiles) {
      toast.error(t('maxFilesReached'))
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(t('fileTooLarge'))
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.set('file', file)
    formData.set('lessonId', lessonId)
    formData.set('blockId', blockId)

    const result = await uploadHomeworkFile(formData)
    setUploading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.fileUrl) {
      const newFiles = [
        ...files,
        {
          name: result.fileName || file.name,
          url: result.fileUrl,
          size: result.fileSize || file.size,
        },
      ]
      setFiles(newFiles)
      await saveFileUploadProgress(blockId, lessonId, newFiles)
      onComplete()
    }
  }

  function handleRemoveFile(index: number) {
    if (readOnly) return
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    saveFileUploadProgress(blockId, lessonId, newFiles)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-3">
      {content.prompt && <p className="font-medium">{content.prompt}</p>}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <FileIcon size={16} className="text-muted-foreground shrink-0" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline truncate flex-1"
              >
                {file.name}
              </a>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatSize(file.size)}
              </span>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveFile(i)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {!readOnly && files.length < maxFiles && (
        <div
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-foreground/20 hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <Upload size={20} className="text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? t('uploading') : t('clickToUpload')}
          </p>
          {extensions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {extensions.map((e) => `.${e}`).join(', ')} ({t('maxSize', { size: maxSizeMb })})
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {teacherFeedback && (
        <div className="rounded-lg border bg-blue-50 p-3 mt-2">
          <p className="text-xs font-medium text-blue-700 mb-1">{t('teacherFeedback')}</p>
          <p className="text-sm">{teacherFeedback}</p>
        </div>
      )}
    </div>
  )
}
