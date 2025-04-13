'use client'
import { useState, useEffect } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import EventsList from './components/EventsList'
import WeeklyView from './components/WeeklyView'
import MonthlyView from './components/MonthlyView'
import { Event, getEvents } from '../lib/events'

export default function EventsPage() {
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
      <div className="min-h-screen bg-[#f9f6f0] text-gray-800 flex items-center justify-center">
        <div className="text-amber-900">Loading events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] text-gray-800 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-playfair text-amber-900">
          Events at Mox
        </h1>

        <TabGroup>
          <TabList className="flex space-x-1 rounded-xl bg-amber-900/20 p-1 mb-6">
            {['Upcoming', 'Week', 'Month'].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-0 focus:outline-none focus:ring-0
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
    </div>
  )
}
