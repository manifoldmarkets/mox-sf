'use client'

import { useEffect, useState } from 'react'

export default function DataErrorBanner() {
  const [isDown, setIsDown] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkHealth() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        if (!res.ok && mounted) setIsDown(true)
        if (res.ok && mounted) setIsDown(false)
      } catch {
        if (mounted) setIsDown(true)
      }
    }

    checkHealth()

    // Re-check every 30s
    const interval = setInterval(checkHealth, 30_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!isDown) return null

  return (
    <div className="bg-red-600 text-white text-center py-4 px-6 font-sans">
      <p className="font-semibold text-base">We&apos;re experiencing technical difficulties</p>
      <p className="text-sm mt-1 text-red-100">
        Some data couldn&apos;t be loaded right now. Parts of the site may not work correctly.
      </p>
    </div>
  )
}
