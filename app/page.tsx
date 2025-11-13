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
      className={`text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2 ${className}`}
    >
      {children}
    </a>
  )
}

export default function Component() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{ backgroundImage: 'url(/images/mox_sketch.png)' }}
        />
        <div className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-12">
            <img
              src="/images/mox_logo_text.svg"
              alt="Mox"
              className="mx-auto mb-8"
              style={{ width: '400px', height: 'auto' }}
            />
            <p className="text-xl mb-4">
              An incubator & community space for <b><em>doers of good</em></b> and <b><em>masters of craft</em></b>.
            </p>
            <p className="text-xl">
              <Link href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco">
                1680 Mission Street, San Francisco
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="bg-white bg-opacity-95 p-6 shadow-xl rounded-3xl">
              <p className="text-base text-gray-800 mb-3 text-center font-semibold">
                We bring together:
              </p>

              <div className="flex flex-wrap justify-start gap-2 mb-3">
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">AI alignment researchers</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Startup founders</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Defensive accelerationists</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Filmmakers</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Writers</p>
                </div>
                                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">High impact nonprofits</p>
                </div>
                                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Artisans</p>
                </div>
<div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Futurists</p>
                </div>

                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Policy advocates</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Community builders</p>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 px-3 py-1 rounded-full">
                  <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">Members of technical staff</p>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="#people"
                  className="text-sm text-amber-800 hover:text-amber-900 underline decoration-dotted underline-offset-2"
                >
                  See people at Mox ↓
                </a>
              </div>
            </div>

            {/* Right column */}
            <div className="bg-white bg-opacity-95 p-6 shadow-xl rounded-3xl flex flex-col justify-between">
              <p className="text-base text-gray-800 mb-6 leading-relaxed">
                Mox offers all the infrastructure you need for deep work, a rich community atmosphere, and events that you'll find meaningful.
              </p>

              <div className="grid grid-cols-1 gap-2">
                <a
                  href="/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-center bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors rounded-full"
                >
                  Apply for membership
                </a>
                <a
                  href="mailto:rachel@moxsf.com"
                  className="px-4 py-2 text-sm text-center bg-white border-2 border-amber-800 text-amber-800 font-semibold hover:bg-amber-50 transition-colors rounded-full"
                >
                  Inquire about offices
                </a>
                <a
                  href="/day-pass"
                  className="px-4 py-2 text-sm text-center bg-white border-2 border-amber-800 text-amber-800 font-semibold hover:bg-amber-50 transition-colors rounded-full"
                >
                  Buy a day pass
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Events section */}
        <section className="mb-16 -mt-24 relative z-20">
          <div className="bg-white p-8 shadow-2xl rounded-3xl border border-amber-100">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-amber-900 font-playfair mb-2">
                Events
              </h2>
              <p className="text-gray-600 text-sm">What's happening at Mox</p>
            </div>
            <EventsPage />
          </div>
        </section>

        <section id="people" className="mb-16">
          <PeopleGallery />
        </section>

        <section className="mt-8 my-16">
          <PeoplePage />
        </section>

        <section className="my-16">
          <Gallery />
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          A project of <Link href="https://manifund.org">Manifund</Link>
          <br />
          Questions? Contact{' '}
          <Link href="mailto:austin@manifund.org">austin@manifund.org</Link>
        </div>
      </footer>
    </div>
  )
}
