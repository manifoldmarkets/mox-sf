'use client'
import { useState, useEffect } from 'react'
import { Person, formatUrl } from './people'

export default function PeopleListClient({ people }: { people: Person[] }) {
  // Randomly select members with links to emphasize (client-side only to avoid hydration mismatch)
  const [emphasizedIds, setEmphasizedIds] = useState<string[]>([])

  useEffect(() => {
    const withLinks = people.filter((p) => p.website)
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
  }, [people])

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {people.map((person) => {
        const isEmphasized = emphasizedIds.includes(person.id)
        const baseClasses =
          'border-2 px-3 py-1 rounded-full transition-colors duration-200'
        const colorClasses = isEmphasized
          ? 'bg-red-50 dark:bg-yellow-900/30 border-red-800 dark:border-yellow-600 hover:bg-red-100 dark:hover:bg-yellow-900/50'
          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'

        const fontWeight = isEmphasized ? 'font-extrabold' : 'font-semibold'

        if (person.website) {
          return (
            <a
              key={person.id}
              href={formatUrl(person.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseClasses} ${colorClasses} cursor-pointer`}
            >
              <p className={`${fontWeight} text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap`}>
                {person.name}
              </p>
            </a>
          )
        } else {
          return (
            <div key={person.id} className={`${baseClasses} ${colorClasses}`}>
              <p className={`${fontWeight} text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap`}>
                {person.name}
              </p>
            </div>
          )
        }
      })}
    </div>
  )
}
