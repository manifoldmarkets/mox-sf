'use client'

interface AdminBannerProps {
  viewingAsName: string
}

export default function AdminBanner({ viewingAsName }: AdminBannerProps) {
  async function exitViewAs() {
    try {
      await fetch('/portal/api/view-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: null }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to exit view-as mode:', error)
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-amber-100 dark:bg-amber-900/30 border-b-2 border-amber-400 dark:border-amber-600 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-amber-700 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Viewing portal as <span className="font-bold">{viewingAsName}</span>
          </span>
        </div>
        <button
          onClick={exitViewAs}
          className="text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 underline focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          Exit View As
        </button>
      </div>
    </div>
  )
}
