'use client'

import { useEffect, useState } from 'react'
import { getAirtableData } from './get-invite-list'

export function JoinContent(props: {
  firstName?: string
  specialInvite?: string
}) {
  const { firstName, specialInvite } = props
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Main intro */}
        {firstName ? (
          <div className="mb-16">
            <h1 className="heading-page-hero mb-6 text-amber-900">
              Join Mox?
            </h1>
            <p className="text-lg text-gray-700">
              Hey {firstName}! I'm excited to invite you to Mox. We're trying
              something a little different here, and the exact shape of our
              space and community is still very TBD; we'd love to figure it out
              with you. Whether you decide to make Mox your main workplace,
              throw an event here, or just drop by once in a while — please
              consider joining!
              <br />
              <br /> — Austin
            </p>
          </div>
        ) : (
          <div className="mb-16">
            <h1 className="heading-page-hero mb-6 text-amber-900">
              Memberships at Mox
            </h1>
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-12 mb-16">
          <section>
            <h2 className="mb-4 text-amber-900">
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
              better fit. This includes a dedicated desk where you can leave
              belongings, and external monitor.
              <br /> <br />
              Finally, if you're not usually in SF, or expect to be coming
              infrequently, we'd love to have you as a <b>Friend</b>. Beyond all
              of our public and members events, you're welcome to drop by once
              or twice a week!
            </p>
          </section>

          {specialInvite === 'friend-of-mythos' && (
            <div className="border border-amber-800 p-6 max-w-4xl mx-auto mt-8">
              <h2 className="mb-4 text-amber-900">
                Friend of Mythos
              </h2>
              <p className="text-gray-700 mb-4">
                Since you're a friend of Vishal's, we'd especially love to have
                you around -- try out a month of membership, on us!
              </p>
              <a
                href="https://buy.stripe.com/7sI2bd9TMb582L6fYY"
                className="inline-block px-6 py-2 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-colors"
              >
                Try out membership
              </a>
            </div>
          )}

          <section>
            <h2 className="mb-4 text-amber-900">
              Mox is in beta — what does that mean?
            </h2>
            <p className="text-gray-700">
              Our space is new, and there's still a lot we're figuring out: what
              kinds of people we host; how we lay out and design the space;
              whether we want to focus on coworking, offices, or events; how our
              financial model will shake out; how we'll orient to the whole AI
              thing...
              <br /> <br />
              The best way to learn is by doing! So our plan is to test out
              different setups and events — things will continue to change a
              lot. Hence, "beta". Hopefully, you're okay with a bit of chaos,
              and are excited to work with us to improve our space.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-amber-900">
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
              invite people slowly, and run at a loss for a while. (We spent
              roughly ~$100k/mo and earned ~$30k/mo across our first three
              months.) We have a bunch of ideas on how to make Mox fiscally
              sustainable: events; grants; sponsorships; donations; incubate
              projects like YC. But for now, we want to make it as easy as
              possible for you to say "yes".
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-amber-900">
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

          <section>
            <h2 className="mb-4 text-amber-900">
              What about private offices?
            </h2>
            <p className="text-gray-700">
              Reach out to{' '}
              <a href="mailto:austin@manifund.org">austin@manifund.org</a>! We
              have a limited number of private offices available on renewable
              3-month leases, starting at $4k/mo for a 4-person office. And if
              you're a startup, we may be interested in investing a small amount
              as well, to align our incentives!
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
          <div className="max-w-4xl mx-auto px-6 pb-12 relative">
            <div className="absolute -top-8 left-6 bg-amber-100 text-gray-800 font-bold text-xs px-2 py-1 rounded">
              Prices during beta
            </div>
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
                  <h2 className="text-amber-900 mb-4">
                     {tier.type}
                  </h2>
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

function useInvited() {
  const [inviteList, setInviteList] = useState<string[] | null>(null)

  useEffect(() => {
    async function fetchInvites() {
      const names = await getAirtableData()
      // Extract first names only
      const firstNames = names.map((name: string) => name.split(' ')[0])
      setInviteList(firstNames)
    }
    fetchInvites()
  }, [])

  return inviteList
}

// Whitelist of special invite codes
const SPECIAL_INVITE_CODES = ['friend-of-mythos']

export default function JoinPage() {
  const inviteList = useInvited()
  const [name, setName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [specialInvite, setSpecialInvite] = useState<string | null>(null)

  // Check for invite parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inviteCode = params.get('invite')
    if (inviteCode && SPECIAL_INVITE_CODES.includes(inviteCode)) {
      setSpecialInvite(inviteCode)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    // If using a special invite code, authorize immediately
    if (specialInvite) {
      setIsAuthorized(true)
      return
    }

    if (inviteList === null) {
      alert('Still loading invites')
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    // Check if the name matches case blind; ignore lowercase
    setIsAuthorized(
      inviteList?.some(
        (allowedName) =>
          allowedName.trim().toLowerCase() === name.trim().toLowerCase()
      ) ?? false
    )
  }
  const niceName =
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase()

  if (isAuthorized) {
    return (
      <>
        <JoinContent firstName={niceName} specialInvite={specialInvite} />
      </>
    )
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
            <h1 className="heading-hero mb-8 text-amber-900">
              You're invited to join Mox
            </h1>

            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <input
                type="text"
                value={name}
                name="firstName"
                autoComplete="given-name"
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
