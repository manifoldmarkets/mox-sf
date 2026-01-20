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

export default function DayPassPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-2xl mx-auto pt-12 pb-8 px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 font-display text-amber-900">
            Mox Day Passes
          </h1>
          <p className="text-gray-600">
            Drop in for a day, evening, or week.
          </p>
        </div>

        {/* Free guest option - emphasized */}
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-center">
          <p className="text-amber-900 font-medium">
            Know a member? You can visit for free as their guest.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Already have access?{' '}
            <a
              href="https://donate.stripe.com/7sY7sN1MQdUJ8Jx126bbG07"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-900"
            >
              Make a donation
            </a>
          </p>
        </div>

        {/* Pass options */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <a
            href="https://buy.stripe.com/00weVf3UY3g5f7V7qubbG02"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center group"
          >
            <div className="text-lg font-bold text-amber-900 mb-1">Day</div>
            <div className="text-2xl font-bold text-gray-800">$70</div>
            <div className="text-xs text-gray-500 mt-1 mb-2">Full day</div>
            <div className="text-xs font-semibold text-amber-800 bg-amber-100 py-1 px-2 group-hover:bg-amber-200 transition-all">
              Buy →
            </div>
          </a>

          <a
            href="https://buy.stripe.com/dRm9AV636cQF8Jx26abbG03"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center group"
          >
            <div className="text-lg font-bold text-amber-900 mb-1">Happy Hour</div>
            <div className="text-2xl font-bold text-gray-800">$40</div>
            <div className="text-xs text-gray-500 mt-1 mb-2">After 4pm</div>
            <div className="text-xs font-semibold text-amber-800 bg-amber-100 py-1 px-2 group-hover:bg-amber-200 transition-all">
              Buy →
            </div>
          </a>

          <a
            href="https://buy.stripe.com/5kQ7sNezC5od8JxcKObbG01"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center group"
          >
            <div className="text-lg font-bold text-amber-900 mb-1">Week</div>
            <div className="text-2xl font-bold text-gray-800">$250</div>
            <div className="text-xs text-gray-500 mt-1 mb-2">7 days</div>
            <div className="text-xs font-semibold text-amber-800 bg-amber-100 py-1 px-2 group-hover:bg-amber-200 transition-all">
              Buy →
            </div>
          </a>
        </div>

        {/* Location */}
        <div className="bg-white border border-slate-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <div className="font-semibold text-gray-800">1680 Mission St, San Francisco</div>
              <div className="text-sm text-gray-500">Between 12th & 13th St</div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="text-center text-sm text-gray-600 mb-8">
          <span className="font-medium">Includes:</span> Monitors • Fast wifi • Coffee & snacks • Meeting rooms • Member events
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
