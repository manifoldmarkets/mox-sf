import Gallery from "./gallery";

function Link({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
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
  );
}

export default function Component() {
  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800">
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
              2. Rare artifacts in{" "}
              <span className="italic">Magic: the Gathering</span>, among the
              most powerful in the game.
            </div>

            <div>
              3. Atypical acronym for{" "}
              <span className="italic">Mixture Of eXperts</span>, an ML
              technique which divides an input between smaller "expert" models.
            </div>

            <div>
              <span className="font-bold">
                4. An upcoming coworking & events space in San Francisco.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-20 px-6">
        <section className="mb-16">
          <Gallery />
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
                <strong>A gathering place for</strong>
              </h2>
              <div className="prose prose-slate">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Startups on the cutting edge</li>
                  <li>EAs and others seeking to improve the world</li>
                  <li>AI and AI safety labs</li>
                  <li>Indie researchers and builders</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
                <strong>About the space</strong>
              </h2>
              <div className="prose prose-slate">
                <p className="mb-4">
                  Located in the heart of SF at{" "}
                  <Link href="https://maps.google.com/?q=1680+Mission+St+San+Francisco">
                    1680 Mission Street
                  </Link>
                  ; formerly the home of{" "}
                  <Link href="https://www.solarissf.com/">Solaris AI</Link>
                </p>

                <div className="mb-4 aspect-video">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.7127335975223!2d-122.42051242356727!3d37.77159011642012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580997b95c7e1%3A0x4e0f8c7d9f9f9b0!2s1680%20Mission%20St%2C%20San%20Francisco%2C%20CA%2094103!5e0!3m2!1sen!2sus!4v1707901234567!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="bg-white shadow-xl p-8 border border-amber-100 relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800"></div>

            <h2 className="text-2xl font-bold mb-6 text-amber-900 font-playfair">
              <strong>Opening Feb 2025</strong>
            </h2>
            <p className="mb-8 text-gray-600">
              Looking for a mission-driven space to work from? We offer
              coworking desks, private offices, and event space.
            </p>

            <a
              href="https://airtable.com/appkHZ2UvU6SouT5y/pagGp5iw06B9Fc57g/form"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-block px-8 py-4 
                bg-amber-800 text-white font-semibold
                hover:bg-amber-900  
                transition-all duration-200
              "
            >
              Join the waitlist
            </a>

            <div className="mt-8 text-sm text-gray-500 italic">
              Limited spots available. Priority given to teams and individuals
              aligned with our community values.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          {/* © 2025 Mox SF. All rights reserved. */}
          {/* Opening February 15th, 2025 */}A project of{" "}
          <Link href="https://manifund.org">Manifund</Link>
        </div>
      </footer>
    </div>
  );
}
