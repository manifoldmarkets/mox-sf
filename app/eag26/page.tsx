function Link({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2 ${className}`}
    >
      {children}
    </a>
  )
}

export default function EAG26DayPassPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-2xl mx-auto pt-12 pb-8 px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 font-display text-amber-900">
            EAG Day Pass
          </h1>
          <p className="text-gray-600">
            Special rate for EAG 2026 attendees.
          </p>
        </div>

        {/* EAG info */}
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-center">
          <p className="text-amber-900 font-medium">
            Welcome, EAG attendees!
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Drop by Mox during your time in SF.
          </p>
        </div>

        {/* Pass option */}
        <div className="flex justify-center mb-8">
          <a
            href="https://buy.stripe.com/EAG_PLACEHOLDER_EAG26"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center group w-48"
          >
            <div className="text-lg font-bold text-amber-900 mb-1">Day Pass</div>
            <div className="text-3xl font-bold text-gray-800">$25</div>
            <div className="text-xs text-gray-500 mt-1 mb-3">Full day access</div>
            <div className="text-sm font-semibold text-amber-800 bg-amber-100 py-2 px-3 group-hover:bg-amber-200 transition-all">
              Buy Now
            </div>
          </a>
        </div>

        {/* Location */}
        <div className="bg-white border border-slate-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <div className="font-semibold text-gray-800">
                1680 Mission St, San Francisco
              </div>
              <div className="text-sm text-gray-500">Between 12th & 13th St</div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="text-center text-sm text-gray-600 mb-8">
          <span className="font-medium">Includes:</span> Monitors • Fast wifi •
          Coffee & snacks • Meeting rooms • Member events
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-200">
          <Link href="/">← moxsf.com</Link>
          {' · '}
          <Link href="mailto:team@moxsf.com">team@moxsf.com</Link>
        </div>
      </div>
    </div>
  )
}
