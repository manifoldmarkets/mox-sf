'use client'
import { useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import EventsList from '../events/components/EventsList'
import WeeklyView from '../events/components/WeeklyView'
import MonthlyView from '../events/components/MonthlyView'
import { Event } from '../lib/events'

export default function EventsSection(props: {
  fullPage?: boolean
  events?: Event[]
}) {
  const { fullPage = false, events = [] } = props
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

  const content = (
    <div className={fullPage ? 'px-4 py-8' : ''}>
      {/* Sync to cal link */}
      <div className="text-center mb-4 max-w-xl mx-auto">
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="text-sm text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2 cursor-pointer"
        >
          Sync to your calendar
        </button>
      </div>

      <TabGroup>
        {/* Tabs with Past as a link-styled tab */}
        <TabList className="flex space-x-1 bg-border-light dark:bg-background-subtle-dark p-1 mb-6 max-w-xl mx-auto">
          {['List', 'Week', 'Month'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `flex-1 py-2.5 text-sm leading-5 ring-0 focus:outline-none focus:ring-0 cursor-pointer whitespace-nowrap
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
          <a
            href="/history"
            className="flex-1 py-2.5 text-sm leading-5 text-center text-text-secondary dark:text-text-secondary-dark hover:bg-background-surface/60 dark:hover:bg-background-subtle-dark hover:text-brand dark:hover:text-brand-dark-mode transition-colors cursor-pointer whitespace-nowrap"
          >
            PAST
          </a>
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
          <DialogPanel className="w-full max-w-sm bg-background-surface dark:bg-background-surface-dark p-6 shadow-xl">
            <DialogTitle className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              Sync events to your calendar
            </DialogTitle>

            <div className="space-y-3">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-google hover:bg-google-hover transition-colors"
              >
                Google Calendar
              </a>

              <a
                href={OUTLOOK_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-outlook hover:bg-outlook-hover transition-colors"
              >
                Outlook Calendar
              </a>

              <a
                href={APPLE_CALENDAR_URL}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-text-primary dark:bg-text-primary hover:bg-text-secondary dark:hover:bg-text-secondary transition-colors"
              >
                Apple Calendar
              </a>

              <button
                onClick={() => {
                  handleCopyUrl()
                }}
                className="cursor-pointer flex items-center justify-center w-full px-4 py-3 text-text-secondary dark:text-text-secondary-dark bg-background-subtle dark:bg-background-subtle-dark hover:bg-border-light dark:hover:bg-border-medium-dark transition-colors"
              >
                {calendarCopied ? 'Copied!' : 'Copy URL to Clipboard'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
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
