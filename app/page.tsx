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

      {/* Hero section with dictionary definition */}
      <div className="max-w-3xl mx-auto pt-16 px-6">
        <div className="border-l-4 border-amber-800 pl-8 py-2">
          <h1 className="text-3xl font-bold mb-2 font-playfair">
            Mox <span className="italic font-normal">/mäks/</span>
          </h1>
          <div className="italic text-lg mb-1">noun</div>

          <div className="space-y-3 mt-6">
            <div>
              1. Abbreviation for <span className="italic">moxie</span>: energy
              and pep, or courage and determination.
            </div>

            <div>
              2. Rare artifacts in{' '}
              <span className="italic">Magic: the Gathering</span>, among the
              most powerful in the game.
            </div>

            <div>
              3. Atypical acronym for{' '}
              <span className="italic">Mixture Of eXperts</span>, a modern
              machine learning technique.
            </div>

            <div>
              <span className="font-bold">
                4. An incubator & community space in San Francisco, on{' '}
                <Link href="https://maps.google.com/?q=Mox+1680+Mission+St+San+Francisco">
                  1680 Mission Street
                </Link>{' '}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-20 px-6">
        <section className="mb-16">
          <PeopleGallery />
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-playfair">
                <strong>A gathering place for</strong>
              </h2>
              <div className="prose prose-slate">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Startups living in the future</li>
                  <li>EAs, and other doers of good</li>
                  <li>AI lab folks & their safety counterparts</li>
                  <li>Indie researchers and builders</li>
                  <li>Writers; artists; masters of craft</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-playfair">
                <strong>Mox offers</strong>
              </h2>
              <div className="prose prose-slate">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Space to work, learn, meet, and play</li>
                  <li>Desks and monitors aplenty</li>
                  <li>Industrial-grade wifi</li>
                  <li>Conference rooms and phone booths</li>
                  <li>Coffee, tea, and snacks</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div>
            <div className="bg-white shadow-xl p-8 border border-slate-100 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800"></div>

              <div>
                <h2 className="text-2xl font-bold mb-6 font-playfair">
                  <strong>Become a member</strong>
                </h2>
                <p className="mb-8 text-gray-600">
                  Looking for a mission-driven space to work from? We offer
                  coworking desks, private offices, and event space.
                </p>

                <div className="space-y-4">
                  <a
                    href="/apply"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                    block w-full px-8 py-4 text-center
                    bg-amber-800 text-white font-semibold
                    hover:bg-amber-900  
                    transition-all duration-200
                  "
                  >
                    Apply for membership
                  </a>
                  
                  <a
                    href="/day-pass"
                    className="
                    block w-full px-8 py-4 text-center
                    bg-white text-amber-800 font-semibold border-2 border-amber-800
                    hover:bg-amber-50  
                    transition-all duration-200
                  "
                  >
                    Day passes starting at $40
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

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
