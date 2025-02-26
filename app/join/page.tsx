'use client'

import { useState } from 'react'

const INVITED = [
  'Asara',
  'Alex',
  'Anna',
  'Antony',
  'Ari',
  'Austin',
  'Ben',
  'Brandon',
  'Cassandra',
  'Charlie',
  'Chris',
  'Constance',
  'Dave',
  'David',
  'Dylan',
  'Elizabeth',
  'Eric',
  'Euan',
  'Gavriel',
  'Gytis',
  'James',
  'Joel',
  'Jonas',
  'Jose',
  'JueYan',
  'Keri',
  'Kipply',
  'Leila',
  'Leo',
  'Michael',
  'Misha',
  'Neall',
  'Noa',
  'Qurat',
  'Rachel',
  'Ricki',
  'Ronak',
  'Ross',
  'Sammy',
  'Saul',
  'Simon',
  'Sinclair',
  'Sophia',
  'Stephen',
  'Sydney',
  'Tom',
  'Trevor',
  'Typed',
  'Vishal',
]

export function JoinContent(props: { firstName?: string }) {
  const { firstName } = props
  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Main intro */}
        {firstName ? (
          <div className="mb-16">
            <h1 className="text-4xl font-bold mb-6 font-playfair text-amber-900">
              Join Mox?
            </h1>
            <p className="text-lg text-gray-700">
              Hey {firstName}! I'm excited to invite you to be one of the
              initial members at Mox. We're trying something a little different
              here, and the exact shape of our space and community is still very
              TBD; but what I know for sure is that I'd love to have you around.
              Whether you decide to make Mox your main workplace, throw an event
              here, or just drop by once in a while — please consider joining!
              <br />
              <br /> — Austin
            </p>
          </div>
        ) : (
          <div className="mb-16">
            <h1 className="text-4xl font-bold mb-6 font-playfair text-amber-900">
              Memberships at Mox
            </h1>
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-12 mb-16">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
              Which membership is right for me?
            </h2>
            <p className="text-gray-700">
              We expect <b>Member</b> to be a good fit for most. As a member,
              you can come by anytime: during the day for focused work, or
              evenings and weekends to hang out. You'll have full access to our
              space: hot desks, lounges, cafeteria, call booths & meeting rooms.
              And we'd ask you to make Mox yours: host small events, bring
              guests, and find ways to help each other flourish.
              <br /> <br />
              If you're planning on coming in 4+ days a week, and especially if
              you're working with teammates, the <b>Resident</b> option may be a
              better fit. This includes a dedicated desk and monitor, beside
              other residents working on similar projects.
              <br /> <br />
              (What about private offices? We plan on supporting these, but
              aren't ready to finalize our space layout, so for now just get
              however many Resident slots, and email me to sort it out.)
              <br /> <br />
              Finally, if you're not usually in SF, or expect to be coming in
              about once a week or less, we'd love to have you as a{' '}
              <b>Friend</b>. You're still welcome at our members events and our
              online community!
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
              Mox is in beta — what does that mean?
            </h2>
            <p className="text-gray-700">
              Our space is brand new, and we're still trying to figure out a
              bunch about our mission: what kinds of people we host; how we lay
              out and design the space; whether we want to focus on coworking,
              offices, or events; how our financial model will shake out; how
              we'll orient to the whole AI thing...
              <br /> <br />
              The best way to learn is by doing! So our plan is to test out
              different setups and events — things might change a lot during the
              next month or two. Hence, "beta". Hopefully, you're okay with a
              bit of chaos, and are excited to work with us to improve our
              space.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
              Why is membership so cheap?
            </h2>
            <p className="text-gray-700">
              I like to say that "Mox isn't a WeWork". We're not here to provide
              some generic coworking service where we maximize the delta between
              our prices and our costs.
              <br /> <br />
              Rather, our priority is to bring in <i>really great people</i>:
              people who make you eager to drop by on a weekend afternoon, who
              you can't help but talk late into the night with, who help you
              become the best version of yourself. People with whom you'll share
              ideas, start projects, invite to your wedding.
              <br /> <br />
              It's so important that great people are at Mox that we're happy to
              invite people slowly, and run at a loss for a while. We have a
              bunch of ideas on how to make Mox fiscally sustainable (eg events;
              grants; sponsorships; donations; incubate projects like YC); for
              now, we want to make it as easy as possible for you to say "yes".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-amber-900 font-playfair">
              What is the guest policy?
            </h2>
            <p className="text-gray-700">
              We want Mox to be a place you're proud to show off to your friends
              and family. So if you want to eg bring in 1-2 folks for a day, go
              ahead and swipe them in, no need to even ask. Beyond that, just
              check in with us about what you have in mind. If a friend of yours
              loves Mox so much they want to be coming in daily, nudge them to
              apply!
            </p>
          </section>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white pt-12">
        {firstName ? (
          <>
            <script
              async
              src="https://js.stripe.com/v3/pricing-table.js"
            ></script>
            {/* @ts-ignore */}
            <stripe-pricing-table
              pricing-table-id="prctbl_1QwTFGRobJaZ7DVCQSiJ4VWj"
              publishable-key="pk_live_51OwnuXRobJaZ7DVC4fdjfPGJOeJbVfXU5ILe4IZhkvuGhI86EimJfQKHMS1BCX3wuJTSXGnvToae5RmfswBPPM7b00D137jyzJ"
            >
              {/* @ts-ignore */}
            </stripe-pricing-table>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <div className="grid grid-cols-3 gap-8">
              {[
                { type: 'Friend', price: '$80' },
                { type: 'Member', price: '$280' },
                { type: 'Resident', price: '$480' },
              ].map((tier) => (
                <div
                  key={tier.type}
                  className="text-center p-8 border border-amber-200"
                >
                  <h3 className="text-2xl font-playfair text-amber-900 mb-4">
                    {tier.type}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mb-2">
                    {tier.price}
                  </p>
                  <p className="text-gray-600">per month</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12 cursor-pointer">
              <a
                href="https://moxsf.com/apply"
                className="inline-block px-8 py-3 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors"
              >
                Apply for membership
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          Questions? Ping{' '}
          <a
            href="mailto:austin@manifund.org"
            className="text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2"
          >
            austin@manifund.org
          </a>
          ~
        </div>
      </footer>
    </div>
  )
}

export default function JoinPage() {
  const [name, setName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Check if the name case blind; ignore lowercase
    setIsAuthorized(
      INVITED.some(
        (allowedName) =>
          allowedName.trim().toLowerCase() === name.trim().toLowerCase()
      )
    )
  }
  const niceName =
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase()

  if (isAuthorized) {
    return <JoinContent firstName={niceName} />
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Envelope design */}
        <div className="bg-white shadow-xl p-12 relative">
          {/* Envelope corners */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800"></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-amber-800"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-amber-800"></div>

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8 font-playfair text-amber-900">
              You're invited to join Mox
            </h1>

            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full px-4 py-2 border border-amber-200 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full px-6 py-2 bg-amber-800 text-white font-semibold rounded-md hover:bg-amber-900 transition-colors"
              >
                Submit
              </button>

              {isSubmitted && !isAuthorized && (
                <p className="mt-4 text-red-600 text-sm">
                  Sorry, we might not be ready to onboard you yet — reach out to{' '}
                  <a
                    href="mailto:austin@manifund.org"
                    className="underline hover:text-red-700"
                  >
                    austin@manifund.org
                  </a>{' '}
                  if this seems like a mistake!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
