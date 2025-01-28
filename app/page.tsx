'use client'


import { useState } from 'react'

export default function Component() {
  // Track hover state for the CTA button
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800 font-serif">
      {/* Hero section with dictionary definition */}
      <div className="max-w-3xl mx-auto pt-16 px-6">
        <div className="border-l-4 border-amber-800 pl-8 py-2">
          <h1 className="text-3xl font-bold mb-2">Mox <span className="italic font-normal">/mäks/</span></h1>
          <div className="italic text-lg mb-1">noun</div>
          
          <div className="space-y-4 mt-6">
            <div>
              <span className="font-bold">1.</span>{" "}
              <strong>Mixture Of eXperts:</strong> an ML technique which divides a problem between smaller "expert" models. 
              <span className="text-gray-600 text-sm"> [abbr., nonstandard]</span>
            </div>
            
            <div>
              <span className="font-bold">2.</span>{" "}
              <strong>Moxen:</strong> rare artifacts from the game Magic: the Gathering; banned in most formats due to power level.
            </div>
            
            <div>
              <span className="font-bold">3.</span>{" "}
              <strong>Moxie:</strong> slang for courage, determination, or energy.
            </div>
            
            <div>
              <span className="font-bold">4.</span>{" "}
              <strong>Mox SF:</strong> An upcoming coworking & events space in San Francisco.
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-20 px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-sans text-amber-900"><strong>The Community</strong></h2>
              <div className="prose prose-slate">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Ambitious startups pushing technological boundaries</li>
                  <li>AI researchers and safety-focused teams</li>
                  <li>Effective Altruism organizations</li>
                  <li>Independent researchers and builders</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 font-sans text-amber-900"><strong>The Space</strong></h2>
              <div className="prose prose-slate">
                <p className="mb-4">
                  Located in the heart of San Francisco at{" "}
                  <a 
                    href="https://maps.google.com/?q=1680+Mission+St+San+Francisco" 
                    className="text-amber-800 hover:text-amber-600 underline decoration-dotted"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1680 Mission Street
                  </a>
                </p>
                <p>Opening February 15th, 2024</p>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="bg-white shadow-xl p-8 border border-amber-100 relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800"></div>
            
            <h2 className="text-2xl font-bold mb-6 font-sans text-amber-900"><strong>Join Our Waitlist</strong></h2>
            <p className="mb-8 text-gray-600">
              Be among the first to experience San Francisco's newest hub for innovation and collaboration.
            </p>
            
            <a 
              href="https://airtable.com/your-form-link" 
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-block px-8 py-4 
                bg-amber-800 text-white font-sans font-semibold
                transform transition-all duration-200
                ${isHovered ? 'translate-x-1 -translate-y-1' : ''}
                shadow-[4px_4px_0px_0px_rgba(120,53,15,1)]
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Request an Invitation
            </a>

            <div className="mt-8 text-sm text-gray-500">
              Limited spots available. Priority given to teams and individuals aligned with our community values.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          © 2024 Mox SF. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
