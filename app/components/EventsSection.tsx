'use client'
import { useState, useEffect } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import EventsList from '../events/components/EventsList'
import WeeklyView from '../events/components/WeeklyView'
import MonthlyView from '../events/components/MonthlyView'
import { Event, getEvents } from '../lib/events'

interface EventsSectionProps {
  fullPage?: boolean // Whether this is being rendered as a full page
}

export default function EventsSection({
  fullPage = false,
}: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div
        className={`text-amber-900 text-center py-8 ${
          fullPage
            ? 'min-h-screen bg-beige-50 flex items-center justify-center'
            : ''
        }`}
      >
        Loading events...
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`text-red-600 text-center py-8 ${
          fullPage
            ? 'min-h-screen bg-beige-50 flex items-center justify-center'
            : ''
        }`}
      >
        {error}
      </div>
    )
  }

  const content = (
    <div className={fullPage ? 'px-4 py-8' : ''}>
      {/* <h2 className="text-3xl font-bold mb-8 font-playfair text-amber-900">
        Events at Mox
      </h2> */}

      <TabGroup>
        <TabList className="flex space-x-1 bg-amber-900/20 p-1 mb-6">
          {['Upcoming Events', 'Week', 'Month'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full rounded-sm py-2.5 text-sm font-medium leading-5 ring-0 focus:outline-none focus:ring-0
                ${
                  selected
                    ? 'bg-white text-amber-900 shadow'
                    : 'text-amber-800 hover:bg-white/[0.12] hover:text-amber-900'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel>
            <EventsList events={events} />
          </TabPanel>
          <TabPanel>
            <WeeklyView events={events} />
          </TabPanel>
          <TabPanel>
            <MonthlyView events={events} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen bg-beige-50 text-gray-800">
        <div className="max-w-6xl mx-auto">{content}</div>
      </div>
    )
  }

  return content
}
