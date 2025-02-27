'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type SubmissionState = 'initial' | 'submitting' | 'success' | 'failure'

export default function DoorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>('initial')

  // Check for code in URL when component mounts
  // Enables auto unlocking via QR code with format `moxsf.com/door?pin=1234`.
  useEffect(() => {
    // Get code from URL
    const pinFromQuery = searchParams.get('pin')

    // If code exists and is numeric, set it as the PIN and auto submit it
    if (pinFromQuery && /^\d+$/.test(pinFromQuery)) {
      setPin(pinFromQuery)

        // Use setTimeout to ensure the PIN is set before submitting
        setTimeout(() => {
          submitPin()
        }, 100)
      }

      // Clear the URL parameter/hash for security (so the code isn't visible in the URL after loading)
      // This is optional but recommended for security
      if (pinFromQuery) {
        router.replace('/door')
      }
  }, [searchParams, router])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Handle numbers 0-9
      if (/^[0-9]$/.test(e.key)) {
        handleNumberClick(e.key)
      }
      // Handle backspace/delete for clear
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        clearPin()
      }
      // Handle enter/return for submit
      else if (e.key === 'Enter') {
        submitPin()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pin]) // Include pin in dependencies since handleNumberClick uses it

  const handleNumberClick = async (num: string) => {
    const newPin = pin + num
    setPin(newPin)
    setSubmissionState('initial')
  }

  const submitPin = async () => {
    setSubmissionState('submitting')
    const startTime = Date.now()
    const response = await fetch('/door/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin }),
    })
    const data = await response.json()
    const elapsed = Date.now() - startTime
    // Ensure the spinner is visible for a bit of time
    if (elapsed < 600) {
      await new Promise((resolve) => setTimeout(resolve, 600 - elapsed))
    }
    setSubmissionState(data.success ? 'success' : 'failure')
  }

  const clearPin = () => {
    setPin('')
    setSubmissionState('initial')
  }

  /* const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '×'],
  ] */

  function NumpadButton(props: {
    value: string | React.ReactNode
    onClick?: () => void
    className?: string
  }) {
    const value = props.value as string
    const onClick = props.onClick ?? (() => handleNumberClick(value))
    const className = props.className ?? 'bg-gray-100 hover:bg-gray-200'
    return (
      <button
        className={`w-20 h-20 rounded-full text-2xl font-medium flex items-center justify-center
                 active:scale-95 transition-all cursor-pointer ${className} border border-gray-200`}
        onClick={onClick}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[280px]">
        <h1 className="font-lora text-center mb-2 text-gray-900">
          Welcome to Mox
        </h1>
        <div className="w-[240px] h-[1px] bg-amber-800 mx-auto mb-12"></div>
        <div
          className={`h-16 text-4xl flex items-center justify-center tracking-wider mb-8 gap-2
                      ${submissionState === 'success' ? 'text-green-500' : ''}
                      ${submissionState === 'failure' ? 'text-red-500' : ''}`}
        >
          {/* {'•'.repeat(pin.length) || ' '} */}
          {pin}
          {submissionState === 'submitting' && <Spinner />}
          {submissionState === 'success' && <span>✓</span>}
          {submissionState === 'failure' && <span>✗</span>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <NumpadButton value="1" />
          <NumpadButton value="2" />
          <NumpadButton value="3" />
          <NumpadButton value="4" />
          <NumpadButton value="5" />
          <NumpadButton value="6" />
          <NumpadButton value="7" />
          <NumpadButton value="8" />
          <NumpadButton value="9" />
          <NumpadButton
            value="✗"
            onClick={clearPin}
            className="bg-red-100 hover:bg-red-200"
          />
          <NumpadButton value="0" />
          <NumpadButton
            value="✓"
            onClick={submitPin}
            className="bg-green-100 hover:bg-green-200"
          />
        </div>
      </div>
    </div>
  )
}

// Tailwind spinner using animate-spin
function Spinner() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
  )
}
