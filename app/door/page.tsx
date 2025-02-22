'use client'

import { useState } from 'react'

export default function DoorPage() {
  const [pin, setPin] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleNumberClick = async (num: string) => {
    const newPin = pin + num
    setPin(newPin)
    setIsSuccess(false)

    try {
      const response = await fetch('/door/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error('Error submitting pin:', error)
    }
  }

  const clearPin = () => {
    setPin('')
    setIsSuccess(false)
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
                 active:scale-95 transition-all duration-150 ${className}`}
        onClick={onClick}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[280px]">
        <div
          className={`h-16 text-4xl flex items-center justify-center tracking-wider font-mono mb-8
                      ${isSuccess ? 'text-green-500' : ''}`}
        >
          {'•'.repeat(pin.length) || ' '}
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
          <NumpadButton value="" />
          <NumpadButton value="0" />
          <NumpadButton value="×" onClick={clearPin} className="bg-red-100" />
        </div>
      </div>
    </div>
  )
}
