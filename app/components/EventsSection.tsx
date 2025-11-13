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
  // Luma has some special trick where it uses an http URL for a cid...
  //
  // But for now we're just hardcoding a public Google Calendar that we sync,
  // Using a hacky Google Apps script: https://github.com/derekantrican/GAS-ICS-Sync?tab=readme-ov-file
  // https://script.google.com/home/projects/146hvkpHs-ODCTfK1MyldW0WJiXofSmHu361ao5eyR8zpvzeOViC_L-hV/edit
  const GOOGLE_CID =
    '6395b6c6ab85cf5ff3b6a1e59bc218ec592b74bfebf94821158bcf7e56c23ab1@group.calendar.google.com'
  const GOOGLE_CALENDAR_URL = `https://www.google.com/calendar/render?cid=${GOOGLE_CID}`
  // Warning, outlook and Apple are basically untested
  const OUTLOOK_CALENDAR_URL = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent('webcal://moxsf.com/api/events-cal')}`
  const APPLE_CALENDAR_URL = `webcal://moxsf.com/api/events-cal`

  return (
    <>
      {/* Header with links */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 max-w-xl mx-auto">
        <a
          href="/substack"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium bg-amber-800 dark:bg-amber-700 text-white hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors cursor-pointer rounded-full"
        >
          Events newsletter
        </a>
        <a
          href="/host-event"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-400 bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors cursor-pointer rounded-full"
        >
          Host an event
        </a>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-400 bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors cursor-pointer rounded-full"
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
          <DialogPanel className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Sync events to your calendar
            </DialogTitle>

            <div className="space-y-3">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-[#4285f4] hover:bg-[#3367d6] rounded-full transition-colors"
              >
                Google Calendar
              </a>

              <a
                href={OUTLOOK_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-full transition-colors"
              >
                Outlook Calendar
              </a>

              <a
                href={APPLE_CALENDAR_URL}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
              >
                Apple Calendar
              </a>

              <button
                onClick={() => {
                  handleCopyUrl()
                }}
                className="cursor-pointer flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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

export default function EventsSection(props: {
  fullPage?: boolean
  events?: Event[]
}) {
  const { fullPage = false, events = [] } = props

  const content = (
    <div className={fullPage ? 'px-4 py-8' : ''}>
      <AddSection />

      <TabGroup>
        <TabList className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 mb-6 max-w-xl mx-auto rounded-full">
          {['Events', 'Week', 'Month'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 ring-0 focus:outline-none focus:ring-0 cursor-pointer rounded-full
                ${
                  selected
                    ? 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.6] dark:hover:bg-gray-600 hover:text-amber-900 dark:hover:text-amber-400'
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
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-6xl mx-auto">{content}</div>
      </div>
    )
  }

  return content
}
