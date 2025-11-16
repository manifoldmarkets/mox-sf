import Gallery from './gallery'
import PeopleGallery from './people-gallery'
import PeoplePage from './people/page'
import EventsPage from './events/page'

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
      className={`text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2 ${className}`}
    >
      {children}
    </a>
  )
}

export default function Component() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Open house banner */}
      {/* <a
        href="https://manifund.org/projects/mox-a-coworking--events-space-in-sf"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-amber-800 text-white text-sm font-semibold text-center py-2 hover:bg-amber-900 transition-colors"
      >
        Mox is fundraising! Learn more & support us <u>here</u>
      </a> */}

      {/* Hero section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 pb-32">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:invert"
          style={{ backgroundImage: 'url(/images/mox_sketch.png)' }}
        />
        <div className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-12">
            <img
              src="/images/mox_logo_text.svg"
              alt="Mox"
              className="mx-auto mb-8 w-full max-w-md dark:invert"
            />
            <p className="text-xl mb-4 leading-relaxed">
              An incubator & community space for <b><em>doers of good</em></b> and <b><em>masters of craft</em></b>.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <Link href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco">
                1680 Mission Street, San Francisco
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 p-6 shadow-xl rounded-3xl">
              <img
                src="/images/014.jpg"
                alt="Mox community"
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <p className="text-base text-gray-700 dark:text-gray-200 mb-4 text-center font-semibold">
                We bring together:
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">AI alignment researchers</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Startup founders</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Defensive accelerationists</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Filmmakers</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Writers</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">High impact nonprofits</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Artisans</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Figgie players</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Policy advocates</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Community builders</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">Members of technical and untechnical staff</p>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="#people"
                  className="text-sm text-amber-800 dark:text-yellow-500 hover:text-amber-900 dark:hover:text-yellow-400 underline decoration-dotted underline-offset-2"
                >
                  See people at Mox ↓
                </a>
              </div>
            </div>

            {/* Right column */}
            <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 p-6 shadow-xl rounded-3xl flex flex-col">
              <img
                src="/images/005.jpg"
                alt="Mox space"
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <p className="text-base text-gray-700 dark:text-gray-200 mb-6 leading-relaxed text-center">
                Mox offers all the infrastructure you need for deep work, a rich community atmosphere, and events that you'll find meaningful.
              </p>

              <div className="flex flex-col gap-2">
                <a
                  href="/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 text-sm text-center bg-amber-800 dark:bg-amber-700 text-white font-semibold hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors rounded-full"
                >
                  Apply for membership
                </a>
                <a
                  href="mailto:rachel@moxsf.com"
                  className="px-6 py-3 text-sm text-center bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors rounded-full"
                >
                  Inquire about offices
                </a>
                <a
                  href="/day-pass"
                  className="px-6 py-3 text-sm text-center bg-white dark:bg-gray-700 border-2 border-amber-800 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors rounded-full"
                >
                  Buy a day pass
                </a>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <a
                    href="/portal/login"
                    className="block text-center text-sm font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-500 underline decoration-dotted underline-offset-2"
                  >
                    Member Portal: Manage Billing & Profile →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Events section */}
        <section className="mb-16 -mt-24 relative z-20">
          <div className="bg-white dark:bg-gray-800 p-8 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
                Events
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">What's happening at Mox</p>
            </div>
            <EventsPage />
          </div>
        </section>

        <section id="people" className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
              Humans of Mox
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">The community that makes Mox special</p>
          </div>
          <PeopleGallery />
        </section>

        <section className="mb-16">
          <PeoplePage />
        </section>

        <section className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
              The Space
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">A glimpse into our home</p>
          </div>
          <Gallery />
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 dark:border-gray-700 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            A project of <Link href="https://manifund.org">Manifund</Link>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Questions? Contact{' '}
            <Link href="mailto:austin@manifund.org">rachel@moxsf.com</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
