'use client'

import { useCallback, useRef, useState } from 'react'

import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ConfirmDialogState {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  confirmText?: string
  confirmTextHint?: string
}

type ConfirmFn = (opts: ConfirmDialogState) => Promise<boolean>

export function useConfirm(): [ConfirmFn, React.ReactNode] {
  const [state, setState] = useState<ConfirmDialogState | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm: ConfirmFn = useCallback((opts) => {
    setState(opts)
    setInputValue('')
    setCopied(false)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  function handleClose(value: boolean) {
    resolveRef.current?.(value)
    resolveRef.current = null
    setState(null)
    setInputValue('')
    setCopied(false)
  }

  function handleCopy() {
    if (!state?.confirmText) return
    navigator.clipboard.writeText(state.confirmText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isConfirmDisabled = state?.confirmText ? inputValue !== state.confirmText : false

  const dialog = (
    <Dialog open={!!state} onOpenChange={(open) => !open && handleClose(false)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{state?.title}</DialogTitle>
          {state?.description && <DialogDescription>{state.description}</DialogDescription>}
        </DialogHeader>
        {state?.confirmText && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {state.confirmTextHint}{' '}
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold text-foreground">{state.confirmText}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center size-5 rounded hover:bg-muted transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check size={12} className="text-[var(--success)]" />
                  ) : (
                    <Copy size={12} className="text-muted-foreground" />
                  )}
                </button>
              </span>
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={state.confirmText}
              autoFocus
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {state?.cancelLabel || 'Cancel'}
          </Button>
          <Button
            variant={state?.variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => handleClose(true)}
            disabled={isConfirmDisabled}
          >
            {state?.confirmLabel || 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return [confirm, dialog]
}
