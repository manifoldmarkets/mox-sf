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
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium bg-brand dark:bg-brand text-white hover:bg-brand-dark dark:hover:bg-brand-dark transition-colors cursor-pointer rounded-full"
        >
          Events newsletter
        </a>
        <a
          href="/events-hosting"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-brand dark:text-brand-dark-mode bg-background-surface dark:bg-background-subtle-dark border-2 border-strong dark:border-strong hover:bg-background-accent dark:hover:bg-background-subtle-dark transition-colors cursor-pointer rounded-full"
        >
          Host an event
        </a>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-brand dark:text-brand-dark-mode bg-background-surface dark:bg-background-subtle-dark border-2 border-strong dark:border-strong hover:bg-background-accent dark:hover:bg-background-subtle-dark transition-colors cursor-pointer rounded-full"
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
          <DialogPanel className="w-full max-w-sm rounded-3xl bg-background-surface dark:bg-background-surface-dark p-6 shadow-xl">
            <DialogTitle className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              Sync events to your calendar
            </DialogTitle>

            <div className="space-y-3">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-google hover:bg-google-hover rounded-full transition-colors"
              >
                Google Calendar
              </a>

              <a
                href={OUTLOOK_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-outlook hover:bg-outlook-hover rounded-full transition-colors"
              >
                Outlook Calendar
              </a>

              <a
                href={APPLE_CALENDAR_URL}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-text-primary dark:bg-text-primary hover:bg-text-secondary dark:hover:bg-text-secondary rounded-full transition-colors"
              >
                Apple Calendar
              </a>

              <button
                onClick={() => {
                  handleCopyUrl()
                }}
                className="cursor-pointer flex items-center justify-center w-full px-4 py-3 text-text-secondary dark:text-text-secondary-dark bg-background-subtle dark:bg-background-subtle-dark hover:bg-border-light dark:hover:bg-border-medium-dark rounded-full transition-colors"
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
        <TabList className="flex space-x-1 bg-border-light dark:bg-background-subtle-dark p-1 mb-6 max-w-xl mx-auto rounded-full">
          {['Events', 'Week', 'Month'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 ring-0 focus:outline-none focus:ring-0 cursor-pointer rounded-full
                ${
                  selected
                    ? 'bg-background-surface dark:bg-background-surface-dark text-brand dark:text-brand-dark-mode shadow'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:bg-background-surface/60 dark:hover:bg-background-subtle-dark hover:text-brand dark:hover:text-brand-dark-mode'
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
      <div className="min-h-screen bg-background-page dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark">
        <div className="max-w-6xl mx-auto">{content}</div>
      </div>
    )
  }

  return content
}
