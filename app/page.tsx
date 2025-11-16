import Gallery from './gallery'
import PeopleGallery from './people-gallery'
import { PeopleContent } from './people/page'
import EventsCardCompact from './components/EventsCardCompact'
import { getEvents } from './lib/events'

function Link({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-brand dark:text-brand-dark-mode hover:text-primary-600 dark:hover:text-primary-300 underline decoration-dotted underline-offset-2 ${className}`}
    >
      {children}
    </a>
  )
}

export default async function Component() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-background-page dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark">
      {/* Top navigation with login */}
      <nav className="fixed top-0 right-0 z-50 p-4">
        <a
          href="/portal"
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark rounded-full hover:bg-background-subtle dark:hover:bg-background-subtle-dark transition-colors shadow-sm"
          aria-label="Login to member portal"
        >
          <svg className="w-5 h-5 text-text-secondary dark:text-text-tertiary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium text-text-secondary dark:text-text-tertiary-dark">Login</span>
        </a>
      </nav>

      {/* Open house banner */}
      {/* <a
        href="https://manifund.org/projects/mox-a-coworking--events-space-in-sf"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-brand text-white text-sm font-semibold text-center py-2 hover:bg-brand-dark transition-colors"
      >
        Mox is fundraising! Learn more & support us <u>here</u>
      </a> */}

      {/* Hero section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 pb-24 sm:pb-32">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:invert"
          style={{ backgroundImage: 'url(/images/mox_sketch.png)' }}
        />
        <div className="relative z-10 max-w-7xl w-full">
          <div className="text-center mb-12">
            <img
              src="/images/mox_logo_text.svg"
              alt="Mox"
              className="mx-auto mb-8 w-full max-w-md dark:invert"
            />
            <p className="text-xl mb-4 leading-relaxed">
              An incubator & community space for <b><em>doers of good</em></b> and <b><em>masters of craft</em></b>.
            </p>
            <p className="text-lg text-text-secondary dark:text-text-tertiary-dark">
              <Link href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco">
                1680 Mission Street, San Francisco
              </Link>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Events column */}
            <div className="bg-background-accent dark:bg-background-surface-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-2xl sm:rounded-3xl flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/003.jpg"
                alt="Mox events"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-brand-dark-mode font-playfair mb-4 text-center">
                  Events we're hosting
                </h3>
                <div className="flex-1">
                  <EventsCardCompact events={events} />
                </div>
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-medium-dark">
                  <a
                    href="/events"
                    className="block text-center text-sm font-semibold text-brand dark:text-brand-dark-mode hover:text-primary-600 dark:hover:text-primary-300 underline decoration-dotted underline-offset-2"
                  >
                    See all events →
                  </a>
                </div>
              </div>
            </div>

            {/* People column */}
            <div className="bg-background-accent dark:bg-background-surface-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-2xl sm:rounded-3xl flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/014.jpg"
                alt="Mox community"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-brand-dark-mode font-playfair mb-4 text-center">
                  Who we're gathering
                </h3>

                <div className="flex flex-wrap justify-center gap-1.5 flex-1">
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">AI alignment researchers</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Startup founders</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Defensive accelerationists</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Filmmakers</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Writers</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">High impact nonprofits</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Artisans</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Figgie players</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Policy advocates</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Community builders</p>
                </div>
                <div className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark px-2 py-0.5 rounded-xl flex items-center">
                  <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-sans leading-tight">Members of technical and untechnical staff</p>
                </div>
              </div>

                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-medium-dark">
                  <a
                    href="#people"
                    className="block text-center text-sm font-semibold text-brand dark:text-brand-dark-mode hover:text-primary-600 dark:hover:text-primary-300 underline decoration-dotted underline-offset-2"
                  >
                    See people →
                  </a>
                </div>
              </div>
            </div>

            {/* Membership column */}
            <div className="bg-background-accent dark:bg-background-surface-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-2xl sm:rounded-3xl flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/005.jpg"
                alt="Mox space"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand-dark dark:text-brand-dark-mode font-playfair mb-6 text-center">
                  Space for meaningful work
                </h3>

                <div className="flex flex-col gap-2 flex-1">
                  <a
                    href="/apply"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-sm text-center bg-brand dark:bg-brand-light text-white font-semibold hover:bg-brand-dark dark:hover:bg-brand transition-colors rounded-full"
                  >
                    Apply for membership
                  </a>
                  <a
                    href="mailto:rachel@moxsf.com"
                    className="px-6 py-3 text-sm text-center bg-background-surface dark:bg-background-subtle-dark border-2 border-strong dark:border-strong-alt text-brand dark:text-brand-dark-mode font-semibold hover:bg-primary-50 dark:hover:bg-border-medium-dark transition-colors rounded-full"
                  >
                    Inquire about offices
                  </a>
                  <a
                    href="/day-pass"
                    className="px-6 py-3 text-sm text-center bg-background-surface dark:bg-background-subtle-dark border-2 border-strong dark:border-strong-alt text-brand dark:text-brand-dark-mode font-semibold hover:bg-primary-50 dark:hover:bg-border-medium-dark transition-colors rounded-full"
                  >
                    Buy a day pass
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-medium-dark">
                  <a
                    href="/portal/login"
                    className="block text-center text-sm font-semibold text-brand dark:text-brand-dark-mode hover:text-primary-600 dark:hover:text-primary-300 underline decoration-dotted underline-offset-2"
                  >
                    Member Portal →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <section id="people" className="mb-12 sm:mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-dark-mode font-playfair mb-2">
              Humans of Mox
            </h2>
            <p className="text-text-tertiary dark:text-text-muted-dark text-sm">The community that makes Mox special</p>
          </div>
          <PeopleGallery />
        </section>

        <section className="mb-12 sm:mb-16">
          <PeopleContent />
        </section>

        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-dark-mode font-playfair mb-2">
              The Space
            </h2>
            <p className="text-text-tertiary dark:text-text-muted-dark text-sm">A glimpse into our home</p>
          </div>
          <Gallery />
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 sm:mt-24 border-t border-border-light dark:border-border-light-dark py-8 sm:py-12 bg-background-surface dark:bg-background-surface-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-text-tertiary dark:text-text-muted-dark mb-2">
            A project of <Link href="https://manifund.org">Manifund</Link>
          </p>
          <p className="text-text-tertiary dark:text-text-muted-dark">
            Questions? Contact{' '}
            <Link href="mailto:rachel@moxsf.com">rachel@moxsf.com</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
