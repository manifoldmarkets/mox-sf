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

function PartnerCard({
  name,
  url,
  logoUrl,
  logoPlaceholder,
}: {
  name: string
  url: string
  logoUrl?: string
  logoPlaceholder?: string
}) {
  return (
    <div className="bg-white p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center">
        <div className="w-24 h-24 bg-black border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-mono mr-4 overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            logoPlaceholder
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          <Link
            href={url}
            className="no-underline hover:text-blue-600 text-gray-900"
          >
            {name}
          </Link>
        </h3>
      </div>
    </div>
  )
}

export default function GuestsPage() {
  return (
    <div className="min-h-screen bg-beige-50 text-gray-800">
      {/* Hero section */}
      <div className="max-w-4xl mx-auto pt-20 px-6">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 font-playfair">
            Mox Guest Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Drop-in access to Mox, for people working on projects we admire.
          </p>
        </div>

        {/* What Mox offers section */}
        <section className="mb-20">
          <div className="bg-white shadow-lg p-8 border border-amber-100 relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800"></div>

            <h2 className="text-3xl font-bold mb-12 text-center font-playfair">
              What Mox offers guests
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-amber-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Flexible Access
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  2x/month access to our coworking and common spaces, through
                  end of 2025
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-amber-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Community Events
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Invitations to Mox member talks and events
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-amber-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Fast-Track
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Fast-tracked application for full membership or office at Mox
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner organizations */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center font-playfair">
            Guest Program Partners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PartnerCard
              name="Lightcone Infrastructure"
              url="https://www.lighthaven.space/"
              logoUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhOH11gCJ3CAw29-65rmtWj5zxTvRWPxNqaw&s"
              logoPlaceholder="LIGHT"
            />
            <PartnerCard
              name="Tarbell Fellowship"
              url="https://www.tarbellfellowship.org/"
              logoUrl="https://static.wixstatic.com/media/dbfe9b_2a27ec41f7b346089b2d5da7dea5a119~mv2.png/v1/fill/w_500,h_500,al_c/dbfe9b_2a27ec41f7b346089b2d5da7dea5a119~mv2.png"
              logoPlaceholder="TARB"
            />
            <PartnerCard
              name="MIRI"
              url="https://intelligence.org/"
              logoUrl="https://intelligence.org/wp-content/uploads/2024/10/Group-47.svg"
              logoPlaceholder="MIRI"
            />
            <PartnerCard
              name="Seldon Lab"
              url="https://seldonlab.com/"
              logoPlaceholder="SELD"
            />
          </div>
        </section>

        {/* Testimonials section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center font-playfair">
            What people say about Mox
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm">
            <div className="bg-white p-6 border-l-4 border-amber-800 shadow-sm">
              <p className="text-gray-700 italic mb-4 leading-relaxed">
                "I think of people at Mox as a collection of my friends and
                not-yet-friends. Nobody feels entirely like a stranger. Mox
                members are (of course) smart, but they're also so open and
                approachable. I can walk up to anyone and have an interesting
                conversation; every single person I've met here has welcomed
                questions about their work and been curious about mine."
              </p>
              <p className="text-amber-800 font-semibold">
                — Gavriel Kleinwaks, Mox Member
              </p>
            </div>
            <div className="bg-white p-6 border-l-4 border-amber-800 shadow-sm">
              <p className="text-gray-700 italic mb-4 leading-relaxed">
                "Mox has the best density of people with the values &
                capabilities I care about the most. In general, it's more social
                & feels better organized for serendipity vs any coworking space
                I've been to before, comparable to perhaps like 0.3 Manifests
                per month."
              </p>
              <p className="text-amber-800 font-semibold">
                — Venki Kumar, Mox Member
              </p>
            </div>
            <div className="bg-white p-6 border-l-4 border-amber-800 shadow-sm">
              <p className="text-gray-700 italic mb-4 leading-relaxed">
                "Austin and his staff have gone to great lengths to make Mox
                incredibly accommodating. Not only is the space already equipped
                with useful things like utensils, printers, and AV, but the
                operational staff are communicative, flexible, and incredibly
                helpful.... I definitely hope to find occasions to host more
                events at Mox down the line, and would highly recommend it to
                anyone I know who is looking for a slightly more casual, but
                exceedingly well-managed venue."
              </p>
              <p className="text-amber-800 font-semibold">
                — Xander Balwit, Asimov Press
              </p>
            </div>
            <div className="bg-white p-6 border-l-4 border-amber-800 shadow-sm">
              <p className="text-gray-700 italic mb-4 leading-relaxed">
                "Mox is a spacious and welcoming coworking space, with kind,
                helpful staff. We would be happy to host an event there again."
              </p>
              <p className="text-amber-800 font-semibold">
                — Sawyer Bernath, Tarbell Fellowship
              </p>
            </div>
          </div>
        </section>

        {/* Why this program section */}
        <section className="mb-20">
          <div className="bg-amber-50 p-8 border-l-4 border-amber-800">
            <h2 className="text-2xl font-bold mb-6 font-playfair">
              Why this guest program?
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <span className="text-amber-800 mr-3 mt-1">•</span>
                <p>
                  Some people work elsewhere, but occasionally visit SF and want
                  a place to work
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-amber-800 mr-3 mt-1">•</span>
                <p>
                  Some people have offices, but want a community space to access
                  on weekends
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-amber-800 mr-3 mt-1">•</span>
                <p>
                  Mox exists to help people exchange ideas; we're always looking
                  for more great folks!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* For Organizations */}
          <div className="bg-white p-8 border border-amber-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 font-playfair">
              For Organizations
            </h2>
            <p className="text-gray-600 mb-6">
              Partner with us to provide your team members with access to our
              vibrant community space.
            </p>
            <div className="space-y-3 mb-6 text-sm text-gray-700">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Host events, talks, and hackathons</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Access to retreats and fellowship space</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Connect with like-minded researchers</span>
              </div>
            </div>
            <a
              href="mailto:team@moxsf.com?subject=Guest Program Partnership"
              className="inline-block px-6 py-3 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors"
            >
              Partner with us
            </a>
          </div>

          {/* For Individuals */}
          <div className="bg-white p-8 border border-amber-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 font-playfair">
              For Individuals
            </h2>
            <p className="text-gray-600 mb-6">
              Join through one of our partner organizations or reach out
              directly if you're working on AI safety.
            </p>
            <div className="space-y-3 mb-6 text-sm text-gray-700">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Professional coworking environment</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Access to talks and community events</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Path to full membership</span>
              </div>
            </div>
            <a
              href="mailto:robin@moxsf.com?subject=Guest Program Interest"
              className="inline-block px-6 py-3 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors"
            >
              Get in touch
            </a>
          </div>
        </div>

        {/* Resources section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center font-playfair">
            Resources for Guests
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-amber-100">
              <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>First time guide:</strong>{' '}
                  <Link href="https://www.notion.so/Visiting-Mox-1af54492ea7a80d9b88ad1a5ad9c78eb?pvs=21">
                    Visiting Mox
                  </Link>
                </div>
                <div>
                  <strong>Check out events:</strong>{' '}
                  <Link href="https://moxsf.com/events">moxsf.com/events</Link>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 border border-amber-100">
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Contact email:</strong>{' '}
                  <Link href="mailto:robin@moxsf.com">robin@moxsf.com</Link>
                </div>
                <div>
                  <strong>Emergency phone:</strong>{' '}
                  <span className="font-mono text-gray-700">415-941-0105</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          <Link href="/">← Back to Mox homepage</Link>
          <br />
          Questions? Contact{' '}
          <Link href="mailto:team@moxsf.com">team@moxsf.com</Link>
        </div>
      </footer>
    </div>
  )
}
