'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { getStudentForEdit, updateStudent } from '../api/students.mutations'

interface StudentData {
  id: string
  full_name: string | null
  email: string | null
}

export function useEditStudentDialog(opts?: { onSaved?: () => void }) {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const tAuth = useTranslations('auth')

  const [profileId, setProfileId] = useState<string | null>(null)
  const [data, setData] = useState<StudentData | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch student data when profileId is set
  useEffect(() => {
    if (!profileId) {
      setData(null)
      return
    }
    let cancelled = false
    setFetching(true)
    getStudentForEdit(profileId).then((result) => {
      if (cancelled) return
      setData(result)
      setFetching(false)
    })
    return () => {
      cancelled = true
    }
  }, [profileId])

  const editStudent = useCallback((studentId: string) => {
    setProfileId(studentId)
  }, [])

  function handleClose() {
    setProfileId(null)
    setData(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!data) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const newEmail = (fd.get('email') as string) || undefined
    await updateStudent(data.id, fd.get('fullName') as string, newEmail)
    setSaving(false)
    handleClose()
    opts?.onSaved?.()
  }

  const editStudentDialog = (
    <Dialog open={!!profileId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editStudent')}</DialogTitle>
        </DialogHeader>
        {fetching ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          data && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">{tAuth('fullName')}</Label>
                <Input
                  id="edit-name"
                  name="fullName"
                  defaultValue={data.full_name || ''}
                  key={data.id}
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-email">{tAuth('email')}</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={data.email || ''}
                  key={`${data.id}-email`}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? tc('loading') : tc('save')}
                </Button>
              </DialogFooter>
            </form>
          )
        )}
      </DialogContent>
    </Dialog>
  )

  return { editStudent, editStudentDialog }
}
