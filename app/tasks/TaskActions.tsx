'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const PRIMARY =
  'inline-flex w-full items-center justify-center gap-2 bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-default transition-colors'
const ERROR =
  'text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/40 px-3 py-2'

async function readError(res: Response): Promise<string> {
  try {
    return (await res.json()).error || 'Something went wrong — try again.'
  } catch {
    return 'Something went wrong — try again.'
  }
}

export function ClaimButton({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function claim() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/tasks/${taskId}/claim`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      setError(await readError(res))
      setBusy(false)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button className={PRIMARY} onClick={claim} disabled={busy}>
        {busy ? 'Claiming…' : 'Claim this task'}
      </button>
      {error && <p className={ERROR}>{error}</p>}
    </div>
  )
}

const MAX_DIM = 1600

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('compress failed'))),
      'image/jpeg',
      0.85
    )
  )
}

export function DonePanel({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  async function markDone() {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('note', noteRef.current?.value || '')
      const file = fileRef.current?.files?.[0]
      if (file) {
        let blob: Blob = file
        try {
          blob = await compressImage(file)
        } catch {
          // Undecodable format (e.g. HEIC outside Safari) — send as-is.
        }
        if (blob.size > 4 * 1024 * 1024) {
          setError(
            'That photo is too large even after compression — try a smaller one.'
          )
          setBusy(false)
          return
        }
        form.set('photo', blob, 'proof.jpg')
      }
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) router.refresh()
      else {
        setError(await readError(res))
        setBusy(false)
      }
    } catch {
      setError('Something went wrong — try again.')
      setBusy(false)
    }
  }

  async function release() {
    if (!confirm('Put this task back on the board for someone else?')) return
    setBusy(true)
    const res = await fetch(`/api/tasks/${taskId}/release`, { method: 'POST' })
    if (res.ok) router.refresh()
    else {
      setError(await readError(res))
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={noteRef}
        rows={3}
        placeholder="Anything to note? (optional)"
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
      />
      <label
        className={`flex cursor-pointer items-center gap-2 border border-dashed px-3 py-3 text-sm ${
          fileName
            ? 'border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
            : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
        />
        {fileName
          ? `📸 ${fileName}`
          : '📷 Add a photo — closes the task instantly'}
      </label>
      <button className={PRIMARY} onClick={markDone} disabled={busy}>
        {busy ? 'Saving…' : 'Mark as done'}
      </button>
      <p className="text-[13px] text-gray-500 dark:text-gray-400">
        Without a photo, the Mox team gives it a quick look before closing.
      </p>
      {error && <p className={ERROR}>{error}</p>}
      <hr className="border-gray-200 dark:border-gray-700" />
      <button
        onClick={release}
        disabled={busy}
        className="text-[13px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline underline-offset-2"
      >
        Can&rsquo;t get to it today? Release the task
      </button>
    </div>
  )
}
