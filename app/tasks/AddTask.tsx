'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { storyForFloor } from '@/app/lib/tasks-floorplans'
import FloorMap from './FloorMap'
import { CHIP_BASE, SKILL_CHIP } from './ui'

const SKILLS = [
  'Space & setup',
  'Errand',
  'Design',
  'Writing',
  'Tech',
  'Events',
  'Ops & admin',
]
const FLOORS = ['1st floor', '2nd floor', '3rd floor', '4th floor', 'Rooftop']
const EFFORTS = ['< 1h', '1–2h', '2–3h']
const MAX_DIM = 1600

const LABEL =
  'flex flex-col gap-1.5 font-sans text-[13px] font-semibold text-gray-500 dark:text-gray-400'
const FIELD =
  'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-normal text-gray-900 dark:text-gray-100'

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

export default function AddTask() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [floor, setFloor] = useState('')
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null)
  const photosRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const story = storyForFloor(floor)

  function toggleSkill(s: string) {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function close() {
    setOpen(false)
    setError('')
    setSkills([])
    setPhotoCount(0)
    setFloor('')
    setPin(null)
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const form = new FormData(e.currentTarget)
      form.delete('photos')
      for (const s of skills) form.append('skills', s)
      if (story && pin) form.set('mapPoint', `${pin.x},${pin.y}`)
      const files = Array.from(photosRef.current?.files ?? []).slice(0, 4)
      for (const file of files) {
        let blob: Blob = file
        try {
          blob = await compressImage(file)
        } catch {
          // Undecodable format — send as-is.
        }
        if (blob.size <= 4 * 1024 * 1024)
          form.append('photos', blob, file.name || 'photo.jpg')
      }
      const res = await fetch('/api/tasks', { method: 'POST', body: form })
      if (res.ok) {
        close()
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong — try again.')
        setBusy(false)
      }
    } catch {
      setError('Something went wrong — try again.')
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium px-3 py-1.5 transition-colors"
      >
        + Add task
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-[6vh]"
            onClick={(e) => {
              if (e.target === e.currentTarget && !busy) close()
            }}
          >
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                  New task
                </h2>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="text-2xl leading-none text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ×
                </button>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-3.5">
                <label className={LABEL}>
                  Title
                  <input
                    name="title"
                    type="text"
                    required
                    maxLength={120}
                    placeholder="Fix the wobbly table by the window"
                    className={FIELD}
                  />
                </label>
                <label className={LABEL}>
                  Card blurb
                  <input
                    name="summary"
                    type="text"
                    maxLength={200}
                    placeholder="One or two sentences shown on the board"
                    className={FIELD}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={LABEL}>
                    Floor
                    <select
                      name="floor"
                      value={floor}
                      onChange={(e) => {
                        setFloor(e.target.value)
                        setPin(null)
                      }}
                      className={FIELD}
                    >
                      <option value="">Anywhere</option>
                      {FLOORS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={LABEL}>
                    Effort
                    <select name="effort" defaultValue="" className={FIELD}>
                      <option value="">Not sure</option>
                      {EFFORTS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={LABEL}>Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`${CHIP_BASE} cursor-pointer ${
                          skills.includes(s)
                            ? SKILL_CHIP[s]
                            : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {story && (
                  <div className="flex flex-col gap-2">
                    <span className={LABEL}>
                      Pin it on the map{' '}
                      <span className="font-normal">(optional)</span>
                      {pin && (
                        <button
                          type="button"
                          onClick={() => setPin(null)}
                          className="ml-2 font-normal underline underline-offset-2"
                        >
                          clear pin
                        </button>
                      )}
                    </span>
                    <FloorMap
                      story={story}
                      pin={pin}
                      interactive
                      onPick={setPin}
                      height={230}
                    />
                  </div>
                )}
                <label className={LABEL}>
                  The task
                  <textarea
                    name="brief"
                    rows={4}
                    placeholder="What needs doing, where things are, anything they should know…"
                    className={FIELD}
                  />
                </label>
                <label className={LABEL}>
                  What done looks like
                  <textarea
                    name="doneCriteria"
                    rows={2}
                    placeholder="How they'll know it's finished"
                    className={FIELD}
                  />
                </label>
                <label className={LABEL}>
                  Links
                  <textarea
                    name="contextLinks"
                    rows={2}
                    placeholder={'Label | https://…  (one per line)'}
                    className={FIELD}
                  />
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-2 border border-dashed px-3 py-3 text-sm ${
                    photoCount
                      ? 'border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <input
                    ref={photosRef}
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
                  />
                  {photoCount
                    ? `📸 ${photoCount} photo${photoCount > 1 ? 's' : ''} attached`
                    : '📷 Add reference photos (optional, up to 4)'}
                </label>
                {error && (
                  <p className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Adding…' : 'Add to the board'}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
