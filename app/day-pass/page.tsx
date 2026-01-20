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
      {/* Hero section */}
      <div className="max-w-3xl mx-auto pt-20 px-6">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 font-display text-amber-900">
            Mox Day Passes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Perfect for visitors from out of town or anyone who needs a great place to work for the day.
            You are also invited to stop by Mox at no cost at the invitation of any current member!
          </p>
        </div>

        {/* What's included */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center font-display">
            What's included
          </h2>
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <div className="prose prose-slate">
              <ul className="list-disc pl-4 space-y-3">
                <li>External monitors, fast wifi</li>
                <li>Free coffee, snacks, and drinks</li>
                <li>Bookable meeting rooms</li>
                <li>AI alignment / startup shop talk</li>
                <li>Access to member events</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pass options */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {/* Day Pass */}
          <div className="bg-white shadow-xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-2 font-display text-amber-900">
              Day Pass
            </h2>
            <div className="text-2xl font-bold text-gray-800 mb-3">$70</div>
            <p className="text-gray-600 text-sm mb-4">
              Full day access to workspace and amenities.
            </p>
            <a
              href="https://buy.stripe.com/00weVf3UY3g5f7V7qubbG02"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 w-full text-center bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200 text-sm"
            >
              Purchase
            </a>
          </div>

          {/* Happy Hour Pass */}
          <div className="bg-white shadow-xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-2 font-display text-amber-900">
              Happy Hour
            </h2>
            <div className="text-2xl font-bold text-gray-800 mb-3">$40</div>
            <p className="text-gray-600 text-sm mb-4">
              Evening access after 4pm. Wind down or catch up on work.
            </p>
            <a
              href="https://buy.stripe.com/dRm9AV636cQF8Jx26abbG03"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 w-full text-center bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200 text-sm"
            >
              Purchase
            </a>
          </div>

          {/* Week Pass */}
          <div className="bg-white shadow-xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-2 font-display text-amber-900">
              Week Pass
            </h2>
            <div className="text-2xl font-bold text-gray-800 mb-3">$250</div>
            <p className="text-gray-600 text-sm mb-4">
              Full week of access. Great for visitors in town.
            </p>
            <a
              href="https://buy.stripe.com/5kQ7sNezC5od8JxcKObbG01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 w-full text-center bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200 text-sm"
            >
              Purchase
            </a>
          </div>
        </div>

        {/* Donation option */}
        <div className="text-center mb-16">
          <p className="text-gray-600 mb-4">
            Already have access? Support Mox with a contribution.
          </p>
          <a
            href="https://donate.stripe.com/7sY7sN1MQdUJ8Jx126bbG07"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 border border-amber-800 text-amber-800 font-semibold hover:bg-amber-50 transition-all duration-200 text-sm"
          >
            Make a Donation
          </a>
        </div>




      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          <Link href="/">← Back to Mox homepage</Link>
          <br />
          Questions? Contact{' '}
          <Link href="mailto:rachel@moxsf.com">rachel@moxsf.com</Link>
        </div>
      </footer>
    </div>
  )
}