'use client'
import { useState, useEffect } from 'react'
import { Person, formatUrl } from './people'

export default function PeopleListClient({
  people,
  showFaces,
}: {
  people: Person[]
  showFaces: boolean
}) {
  // Randomly select members with links to emphasize (client-side only to avoid hydration mismatch)
  const [emphasizedIds, setEmphasizedIds] = useState<string[]>([])

  useEffect(() => {
    const withLinks = people.filter((p) => p.website)

    // Function to select a new set of emphasized people
    const selectEmphasized = () => {
      // Distribute emphasis evenly: select ~1/12th by picking from evenly spaced intervals
      const interval = 12
      const emphasized: string[] = []

      for (let i = 0; i < withLinks.length; i += interval) {
        // Pick a random person from this interval
        const chunkSize = Math.min(interval, withLinks.length - i)
        const randomOffset = Math.floor(Math.random() * chunkSize)
        emphasized.push(withLinks[i + randomOffset].id)
      }

      setEmphasizedIds(emphasized)
    }

    // Set initial emphasized people
    selectEmphasized()

    // Rotate every 3 seconds
    const intervalId = setInterval(selectEmphasized, 3000)

    return () => clearInterval(intervalId)
  }, [people])

  const getPhotoUrl = (person: Person): string | null => {
    if (person.photo && person.photo.length > 0 && person.photo[0].url) {
      return person.photo[0].url
    }
    return null
  }

  // Get optimized thumbnail URL from Airtable
  const getOptimizedPhotoUrl = (person: Person): string | null => {
    if (person.photo && person.photo.length > 0) {
      // Try large thumbnail first, then small, then fall back to full URL
      if (person.photo[0].thumbnails?.large?.url) {
        return person.photo[0].thumbnails.large.url
      }
      if (person.photo[0].thumbnails?.small?.url) {
        return person.photo[0].thumbnails.small.url
      }
    }
    return getPhotoUrl(person)
  }

  if (showFaces) {
    return (
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4">
        <div className="flex flex-wrap justify-center gap-8 max-w-[75vw] mx-auto">
          {people.map((person) => {
            const photoUrl = getOptimizedPhotoUrl(person)
            const content = (
              <div className="flex flex-col items-center w-20 sm:w-24 md:w-28">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden bg-secondary-100 dark:bg-amber-900 mb-1 shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={person.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-secondary-600 dark:text-amber-700">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-text-primary dark:text-text-primary-dark leading-tight">
                  {person.name}
                </p>
              </div>
            )

            if (person.website) {
              return (
                <a
                  key={person.id}
                  href={formatUrl(person.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  {content}
                </a>
              )
            } else {
              return <div key={person.id}>{content}</div>
            }
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {people.map((person) => {
        const isEmphasized = emphasizedIds.includes(person.id)
        const baseClasses =
          'border px-3 py-1 transition-all duration-700 ease-in-out'
        const colorClasses = isEmphasized
          ? 'bg-gray-100 dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-550'
          : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600'

        const fontWeight = isEmphasized ? '' : ''

        if (person.website) {
          return (
            <a
              key={person.id}
              href={formatUrl(person.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseClasses} ${colorClasses} cursor-pointer`}
            >
              <p
                className={`${fontWeight} text-text-primary dark:text-text-primary-dark text-sm whitespace-nowrap`}
              >
                {person.name}
              </p>
            </a>
          )
        } else {
          return (
            <div key={person.id} className={`${baseClasses} ${colorClasses}`}>
              <p
                className={`${fontWeight} text-text-primary dark:text-text-primary-dark text-sm whitespace-nowrap`}
              >
                {person.name}
              </p>
            </div>
          )
        }
      })}
    </div>
  )
}
