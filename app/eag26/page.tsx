'use client'

import { useState } from 'react'

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

const STRIPE_LINK = 'https://buy.stripe.com/EAG_PLACEHOLDER_EAG26'
const PRICE_PER_PASS = 25

export default function EAG26DayPassPage() {
  const [quantity, setQuantity] = useState(1)

  const total = quantity * PRICE_PER_PASS
  const buyUrl = `${STRIPE_LINK}?quantity=${quantity}`

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

        {/* Pass option with quantity selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-6 border-2 border-slate-200 text-center w-64">
            <div className="text-lg font-bold text-amber-900 mb-1">Day Pass</div>
            <div className="text-3xl font-bold text-gray-800">${PRICE_PER_PASS}</div>
            <div className="text-xs text-gray-500 mt-1 mb-4">Full day access</div>

            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center border border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-all text-lg font-bold text-gray-600"
              >
                -
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-8 h-8 flex items-center justify-center border border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-all text-lg font-bold text-gray-600"
              >
                +
              </button>
            </div>

            {/* Total */}
            {quantity > 1 && (
              <div className="text-sm text-gray-600 mb-3">
                {quantity} passes = <span className="font-semibold">${total}</span>
              </div>
            )}

            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-semibold text-amber-800 bg-amber-100 py-2 px-3 hover:bg-amber-200 transition-all"
            >
              Buy {quantity > 1 ? `${quantity} Passes` : 'Now'}
            </a>
          </div>
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
