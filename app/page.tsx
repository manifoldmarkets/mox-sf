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
      <div className="max-w-3xl mx-auto pt-16 px-6 text-center">
        <img
          src="/images/mox_logo_text.svg"
          alt="Mox"
          className="mx-auto mb-8"
          style={{ width: '400px', height: 'auto' }}
        />
        <p className="text-xl">
          An incubator & community space for <b><em>doers of good</em></b> and <b><em>masters of craft</em></b>.
          </p>
          <p className="text-xl">
          <Link href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco">
            1680 Mission Street, San Francisco
          </Link>
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-20 px-6">
        <div className="bg-white p-12 mb-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-800 mb-6 leading-relaxed">
              Mox is where San Francisco's most interesting minds work on what matters. We bring together:
            </p>

            <ul className="space-y-3 mb-8 text-gray-700 border-l-4 border-amber-800 pl-8">
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>AI alignment researchers and safety advocates</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>Startup founders building the future</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>Nonprofits working on welfare, climate, and techno-resilience</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>Independent writers, artists, and community builders</span>
              </li>
            </ul>

            <p className="text-lg text-gray-800 mb-6 leading-relaxed">
              We value intellectual rigor, philosophical inquiry, ambitious work, and making things happen.
              Mox offers:
            </p>

            <ul className="space-y-3 mb-10 text-gray-700 border-l-4 border-amber-800 pl-8">
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>All the infrastructure you need for deep work</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>A rich community atmosphere with lunchtime gatherings and evening events</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-800 mr-3">•</span>
                <span>Great conversations</span>
              </li>
            </ul>

            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-center bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors"
              >
                Apply for membership
              </a>
              <a
                href="mailto:rachel@moxsf.com"
                className="px-6 py-3 text-center bg-white border-2 border-amber-800 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
              >
                Inquire about offices
              </a>
              <a
                href="/day-pass"
                className="px-6 py-3 text-center bg-white border-2 border-amber-800 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
              >
                Buy a day pass
              </a>
            </div>
          </div>
        </div>

        <section className="mb-16 mt-16">
          <PeopleGallery />
        </section>

        {/* Events section */}
        <section className="mt-8 my-16">
          <EventsPage />
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
