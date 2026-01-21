'use client'

export default function RenewContent({
  firstName,
  email,
  status,
}: {
  firstName: string
  email: string
  status: string | null
}) {
  const isCancelled = status === 'Cancelled'

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/portal"
            className="text-amber-800 hover:text-amber-600 text-sm mb-4 inline-block"
          >
            &larr; Back to Portal
          </a>
          <h1 className="text-4xl font-bold mb-6 font-display text-amber-900">
            {isCancelled ? 'Renew Your Membership' : 'Start Your Membership'}
          </h1>
          <p className="text-lg text-gray-700">
            {isCancelled ? (
              <>
                Hey {firstName}! We'd love to have you back at Mox. Choose a
                membership tier below to rejoin with a 1-week free trial.
              </>
            ) : (
              <>
                Hey {firstName}! Choose a membership tier below to get started
                with a 1-week free trial.
              </>
            )}
          </p>
        </div>

        {/* Membership tiers explanation */}
        <div className="space-y-8 mb-12">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-amber-900 font-display">
              Which membership is right for me?
            </h2>
            <p className="text-gray-700">
              We expect <u className="underline-offset-2">Member</u> to be a
              good fit for most. As a member, you can come by anytime: during
              the day for focused work, or evenings and weekends to hang out.
              You'll have full access to our space: hot desks, lounges,
              cafeteria, call booths & meeting rooms.
              <br /> <br />
              If you're planning on coming in 4+ days a week, and especially if
              you're working with teammates, the{' '}
              <u className="underline-offset-2">Resident</u> option may be a
              better fit. This includes a dedicated desk where you can leave
              belongings, and external monitor.
              <br /> <br />
              Finally, if you're not usually in SF, or expect to be coming
              infrequently, we'd love to have you as a{' '}
              <u className="underline-offset-2">Friend</u>. Beyond all of our
              public and members events, you're welcome to drop by up to twice a
              week!
            </p>
          </section>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white pt-12 pb-16">
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        {/* @ts-ignore */}
        <stripe-pricing-table
          pricing-table-id="prctbl_1SBTulRobJaZ7DVC19nKSvjs"
          publishable-key="pk_live_51OwnuXRobJaZ7DVC4fdjfPGJOeJbVfXU5ILe4IZhkvuGhI86EimJfQKHMS1BCX3wuJTSXGnvToae5RmfswBPPM7b00D137jyzJ"
          customer-email={email || undefined}
        >
          {/* @ts-ignore */}
        </stripe-pricing-table>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          Questions? Ping{' '}
          <a
            href="mailto:rachel@moxsf.com"
            className="text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2"
          >
            rachel@moxsf.com
          </a>
        </div>
      </footer>
    </div>
  )
}
