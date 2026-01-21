import { getSession } from '@/app/lib/session'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stripeCustomerId = searchParams.get('customerId')

    if (!stripeCustomerId) {
      return Response.json(
        { error: 'No Stripe customer ID provided' },
        { status: 400 }
      )
    }

    // Fetch all subscriptions for this customer (not just active)
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 10,
    })

    if (subscriptions.data.length === 0) {
      return Response.json({
        subscription: null,
        message: 'No subscription found',
      })
    }

    // Find the first active, trialing, or past_due subscription
    const activeSubscription = subscriptions.data.find((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    )

    if (!activeSubscription) {
      return Response.json({
        subscription: null,
        message: `No active subscription found. Found ${subscriptions.data.length} subscription(s) with status: ${subscriptions.data.map((s) => s.status).join(', ')}`,
      })
    }

    const subscription = activeSubscription
    const priceItem = subscription.items.data[0]
    const price = priceItem.price

    // Fetch the product separately to avoid expansion depth limit
    const productId =
      typeof price.product === 'string' ? price.product : price.product.id
    const product = await stripe.products.retrieve(productId)

    // Format the renewal date - get it from the subscription item
    const currentPeriodEnd = (priceItem as any).current_period_end
    const renewalDate = new Date(currentPeriodEnd * 1000)

    // Calculate the rate (convert from cents to dollars)
    const amount = price.unit_amount ? price.unit_amount / 100 : 0
    const interval = price.recurring?.interval || 'month'

    // Check if subscription is paused
    let pausedUntil: string | null = null
    if (subscription.pause_collection?.resumes_at) {
      pausedUntil = new Date(
        subscription.pause_collection.resumes_at * 1000
      ).toISOString()
    }

    return Response.json({
      subscription: {
        tier: product.name,
        rate: `$${amount}/${interval}`,
        renewalDate: renewalDate.toISOString(),
        status: subscription.status,
        pausedUntil: pausedUntil,
        isPaused: !!subscription.pause_collection,
      },
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return Response.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}
