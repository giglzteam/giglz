export type PlanId = 'free' | 'plus' | 'pro'

export const PLANS: Record<PlanId, {
  name: string
  priceId: string | null
  isPlusPro: boolean
}> = {
  free: {
    name: 'Free',
    priceId: null,
    isPlusPro: false,
  },
  plus: {
    name: 'Plus',
    priceId: process.env.STRIPE_PLUS_PRICE_ID ?? null,
    isPlusPro: true,
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    isPlusPro: true,
  },
}
