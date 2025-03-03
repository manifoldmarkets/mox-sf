'use client'

import { useEffect } from 'react'
import DoorPage from '../page'
import { useParams } from 'next/navigation'

export default function DoorPinPage() {
  const params = useParams()
  const pin = params?.pin as string

  // Validate that pin contains only numbers
  const isValidPin = /^\d+$/.test(pin)

  if (!isValidPin) {
    // If pin is invalid, redirect to main door page
    useEffect(() => {
      window.location.href = '/door'
    }, [])
    return null
  }

  return <DoorPage initialPin={pin} />
}
