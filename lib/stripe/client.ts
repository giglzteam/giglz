import Stripe from 'stripe'

// Use 2024-06-20 — 2025-01-27.acacia removed Subscription.current_period_end
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
  typescript: true,
})
