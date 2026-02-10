'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SessionData {
  isLoggedIn: boolean
  name?: string
  email?: string
}

export default function PortalNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<SessionData | null>(null)
  const [bannerHeight, setBannerHeight] = useState(0)

  // Don't render on portal pages
  const isPortalPage = pathname?.startsWith('/portal')

  useEffect(() => {
    if (isPortalPage) return

    fetch('/portal/api/session')
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ isLoggedIn: false }))
  }, [isPortalPage])

  // Track banner visibility and adjust nav position on scroll
  useEffect(() => {
    const updateNavPosition = () => {
      const banner = document.querySelector('[data-top-banner]')
      if (!banner) {
        setBannerHeight(0)
        return
      }
      // Get how much of the banner is still visible (bottom edge relative to viewport top)
      const bannerBottom = banner.getBoundingClientRect().bottom
      // Nav should be positioned at banner bottom, but never below 0
      setBannerHeight(Math.max(0, bannerBottom))
    }

    // Check immediately and after a short delay (for SSR hydration)
    updateNavPosition()
    const timeout = setTimeout(updateNavPosition, 100)

    // Update on scroll
    window.addEventListener('scroll', updateNavPosition, { passive: true })

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', updateNavPosition)
    }
  }, [pathname])

  // Don't render on portal pages or while loading
  if (isPortalPage || !session) {
    return null
  }

  return (
    <nav
      className="fixed right-0 z-50 p-4"
      style={{ top: bannerHeight }}
    >
      {session.isLoggedIn ? (
        <a
          href="/portal"
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors shadow-sm"
          aria-label="Go to member portal"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="sm:inline text-sm text-gray-600 dark:text-gray-400 font-sans">
            {session.name || session.email}
          </span>
        </a>
      ) : (
        <a
          href="/portal"
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 bg-amber-900 dark:bg-yellow-400 border border-amber-900 dark:border-yellow-400 hover:bg-amber-800 dark:hover:bg-yellow-300 transition-colors shadow-sm text-white dark:text-gray-900"
          aria-label="Login to member portal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="sm:inline text-sm uppercase font-sans font-semibold">
            Login
          </span>
        </a>
      )}
    </nav>
  )
}
