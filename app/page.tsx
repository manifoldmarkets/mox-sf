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
      className={`text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 underline decoration-dotted underline-offset-2 ${className}`}
    >
      {children}
    </a>
  )
}

export default async function Component() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-background-page dark:bg-primary-950 text-text-primary dark:text-text-primary-dark">
      {/* Top navigation with login */}
      <nav className="fixed top-0 right-0 z-50 p-4">
        <a
          href="/portal"
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 bg-background-surface dark:bg-background-surface-dark border border-secondary-200 dark:border-primary-700 rounded-full hover:bg-background-subtle dark:hover:bg-background-subtle-dark transition-colors shadow-sm"
          aria-label="Login to member portal"
        >
          <svg className="w-5 h-5 text-text-secondary dark:text-text-tertiary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline text-sm font-semibold text-text-secondary dark:text-text-tertiary-dark uppercase font-sans">Login</span>
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
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 pb-24 sm:pb-32 bg-background-page dark:bg-primary-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:invert"
          style={{
            backgroundImage: 'url(/images/mox_sketch.png)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
          }}
        />
        <div className="relative z-10 max-w-7xl w-full">
          <div className="text-center mb-12">
            <img
              src="/images/mox_logo_text.svg"
              alt="Mox"
              className="mx-auto mb-8 w-full max-w-md dark:invert dark:opacity-90"
            />
            <p className="text-xl mb-4 leading-relaxed text-brand-dark dark:text-primary-50">
              An incubator & community space for <b><em>doers of good</em></b> and <b><em>masters of craft</em></b>.
            </p>
            <p className="text-lg text-brand-dark dark:text-primary-100">
              <Link
                href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco"
                className="dark:!text-primary-200 dark:hover:!text-primary-50"
              >
                1680 Mission Street, San Francisco
              </Link>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Events column */}
            <div className="bg-background-surface dark:bg-background-accent-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-lg flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/003.jpg"
                alt="Mox events"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand dark:text-white font-playfair mb-4 text-center">
                  Events we're hosting
                </h3>
                <div className="flex-1">
                  <EventsCardCompact events={events} />
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-primary-700">
                  <a
                    href="/events"
                    className="block text-center text-sm font-semibold text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 underline decoration-dotted underline-offset-2"
                  >
                    See all events →
                  </a>
                </div>
              </div>
            </div>

            {/* People column */}
            <div className="bg-background-surface dark:bg-background-accent-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-lg flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/014.jpg"
                alt="Mox community"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand dark:text-white font-playfair mb-4 text-center">
                  Who we're gathering
                </h3>

                <div className="flex flex-wrap justify-center gap-1.5 flex-1">
                {[
                  'AI alignment researchers',
                  'Startup founders',
                  'Defensive accelerationists',
                  'Filmmakers',
                  'Writers',
                  'High impact nonprofits',
                  'Artisans',
                  'Figgie players',
                  'Policy advocates',
                  'Community builders',
                  'Members of technical and untechnical staff'
                ].map((label) => (
                  <div key={label} className="bg-background-surface dark:bg-background-accent-dark border-2 border-secondary-600 dark:border-secondary-700 px-3 py-1 rounded-full flex items-center">
                    <p className="text-text-primary dark:text-text-secondary-dark text-sm whitespace-nowrap font-semibold leading-tight">{label}</p>
                  </div>
                ))}
              </div>

                <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-primary-700">
                  <a
                    href="#people"
                    className="block text-center text-sm font-semibold text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 underline decoration-dotted underline-offset-2"
                  >
                    See people →
                  </a>
                </div>
              </div>
            </div>

            {/* Membership column */}
            <div className="bg-background-surface dark:bg-background-accent-dark bg-opacity-95 dark:bg-opacity-95 shadow-xl rounded-lg flex flex-col md:flex-row lg:flex-col overflow-hidden">
              <img
                src="/images/005.jpg"
                alt="Mox space"
                className="w-full md:w-48 lg:w-full h-48 md:h-auto lg:h-48 object-cover flex-shrink-0"
              />
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-brand dark:text-white font-playfair mb-6 text-center">
                  Space for meaningful work
                </h3>

                <div className="flex flex-col gap-2 flex-1">
                  <a
                    href="/apply"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-sm text-center bg-secondary-600 dark:bg-secondary-700 text-white font-semibold hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors rounded-lg"
                  >
                    Apply for membership
                  </a>
                  <a
                    href="/offices"
                    className="px-6 py-3 text-sm text-center bg-background-surface dark:bg-background-accent-dark border-2 border-secondary-600 dark:border-secondary-500 text-secondary-700 dark:text-secondary-400 font-semibold hover:bg-secondary-50 dark:hover:bg-border-medium-dark transition-colors rounded-lg"
                  >
                    Inquire about offices
                  </a>
                  <a
                    href="/day-pass"
                    className="px-6 py-3 text-sm text-center bg-background-surface dark:bg-background-accent-dark border-2 border-secondary-600 dark:border-secondary-500 text-secondary-700 dark:text-secondary-400 font-semibold hover:bg-secondary-50 dark:hover:bg-border-medium-dark transition-colors rounded-lg"
                  >
                    Buy a day pass
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-primary-700">
                  <a
                    href="/portal/login"
                    className="block text-center text-sm font-semibold text-secondary-700 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 underline decoration-dotted underline-offset-2"
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
            <h2 className="text-3xl font-bold text-brand dark:text-white font-playfair mb-2">
              Humans of Mox
            </h2>
            <p className="text-brand-dark dark:text-primary-100 text-sm">The community that makes Mox special</p>
          </div>
          <PeopleGallery />
        </section>

        <section className="mb-12 sm:mb-16">
          <PeopleContent />
        </section>

        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-brand dark:text-white font-playfair mb-2">
              The Space
            </h2>
            <p className="text-brand-dark dark:text-primary-100 text-sm">A glimpse into our home</p>
          </div>
          <Gallery />
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 sm:mt-24 py-8 sm:py-12">
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
