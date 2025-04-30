'use client'
import { useState, useEffect } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import EventsList from '../events/components/EventsList'
import WeeklyView from '../events/components/WeeklyView'
import MonthlyView from '../events/components/MonthlyView'
import { Event, getEvents } from '../lib/events'

function AddSection() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarCopied, setCalendarCopied] = useState(false)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://moxsf.com/api/events-cal')
    setCalendarCopied(true)
    setTimeout(() => setCalendarCopied(false), 4000)
  }

  // See also https://webapps.stackexchange.com/questions/116392/how-to-get-a-link-to-add-a-google-calendar
  // Luma has some special trick where it uses a URL for a cid...
  // But for now we're just hardcoding a public Google Calendar that we sync
  const GOOGLE_CID =
    '7vcnf7755ldvn1re8ob2o1qmoeng8pie@import.calendar.google.com'
  const GOOGLE_CALENDAR_URL = `https://www.google.com/calendar/render?cid=${GOOGLE_CID}`
  // Warning, outlook and Apple are basically untested
  const OUTLOOK_CALENDAR_URL = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent('webcal://moxsf.com/api/events-cal')}`
  const APPLE_CALENDAR_URL = `webcal://moxsf.com/api/events-cal`

  return (
    <>
      {/* Header with links */}
      <div className="flex justify-end gap-4 mb-6">
        <a
          href="/host-event"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-800 bg-white border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          Host an event
        </a>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-800 bg-white border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          Sync to cal
        </button>
      </div>

      {/* Calendar Dialog */}
      <Dialog
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        className="relative z-50"
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container for centering */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Sync events to your calendar
            </DialogTitle>

            <div className="space-y-3">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-[#4285f4] hover:bg-[#3367d6] rounded transition-colors"
              >
                Google Calendar
              </a>

              <a
                href={OUTLOOK_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-[#0078d4] hover:bg-[#106ebe] rounded transition-colors"
              >
                Outlook Calendar
              </a>

              <a
                href={APPLE_CALENDAR_URL}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors"
              >
                Apple Calendar
              </a>

              <button
                onClick={() => {
                  handleCopyUrl()
                }}
                className="cursor-pointer flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {calendarCopied ? 'Copied!' : 'Copy URL to Clipboard'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

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
      .catch((e) => {
        console.error('Error fetching events:', e)
        setError('Failed to load events')
      })
      .finally(() => setLoading(false))
  }, [])

  console.log('e', events)

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
      <AddSection />

      <TabGroup>
        <TabList className="flex space-x-1 bg-amber-900/20 p-1 mb-6">
          {['Events', 'Week', 'Month'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 ring-0 focus:outline-none focus:ring-0 cursor-pointer
                ${
                  selected
                    ? 'bg-white text-amber-900 shadow'
                    : 'text-amber-800 hover:bg-white/[0.12] hover:text-amber-900'
                }`
              }
            >
              {tab.toUpperCase()}
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
