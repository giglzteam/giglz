import Stripe from 'stripe'
import { handleWebhookEvent } from '@/lib/stripe/handleWebhookEvent'

function makeSupabase(overrides: Record<string, jest.Mock> = {}) {
  const single = jest.fn().mockResolvedValue({ data: null })
  const eq = jest.fn().mockReturnValue({ single })
  const update = jest.fn().mockReturnValue({ eq })
  const upsert = jest.fn().mockResolvedValue({ error: null })
  const select = jest.fn().mockReturnValue({ eq })
  const from = jest.fn().mockReturnValue({ select, update, upsert, eq })
  return { from, _mocks: { single, eq, update, upsert, select }, ...overrides }
}

function makeStripe(subOverride?: Partial<Stripe.Subscription>) {
  const sub = {
    id: 'sub_123',
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + 86400,
    ...subOverride,
  } as Stripe.Subscription
  return {
    subscriptions: { retrieve: jest.fn().mockResolvedValue(sub) },
  } as unknown as Stripe
}

describe('handleWebhookEvent', () => {
  it('upserts subscription and updates profile plan on checkout.session.completed with userId', async () => {
    const supabase = makeSupabase()
    const stripeClient = makeStripe()

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user-1', plan: 'plus' },
          subscription: 'sub_123',
          customer: 'cus_123',
        },
      },
    } as unknown as Stripe.Event

    await handleWebhookEvent(event, supabase as any, stripeClient)

    expect(supabase.from).toHaveBeenCalledWith('subscriptions')
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('falls back to stripe_customer_id lookup when userId metadata is empty', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 'user-2' } })
    const eq = jest.fn().mockReturnValue({ single })
    const update = jest.fn().mockReturnValue({ eq })
    const upsert = jest.fn().mockResolvedValue({ error: null })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select, update, upsert, eq })
    const supabase = { from }
    const stripeClient = makeStripe()

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: '', plan: 'plus' },
          subscription: 'sub_123',
          customer: 'cus_999',
        },
      },
    } as unknown as Stripe.Event

    await handleWebhookEvent(event, supabase as any, stripeClient)

    // profiles queried by stripe_customer_id
    expect(from).toHaveBeenCalledWith('profiles')
  })

  it('updates status on customer.subscription.updated', async () => {
    const supabase = makeSupabase()
    const stripeClient = makeStripe()

    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'past_due',
          current_period_end: 9999999999,
        },
      },
    } as unknown as Stripe.Event

    await handleWebhookEvent(event, supabase as any, stripeClient)

    expect(supabase.from).toHaveBeenCalledWith('subscriptions')
  })

  it('sets plan to free on customer.subscription.deleted', async () => {
    const single = jest.fn().mockResolvedValue({ data: { user_id: 'user-1' } })
    const eq = jest.fn().mockReturnValue({ single })
    const update = jest.fn().mockReturnValue({ eq })
    const upsert = jest.fn().mockResolvedValue({ error: null })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select, update, upsert, eq })
    const supabase = { from }

    const event = {
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123' } },
    } as unknown as Stripe.Event

    await handleWebhookEvent(event, supabase as any, makeStripe())

    expect(from).toHaveBeenCalledWith('subscriptions')
    expect(from).toHaveBeenCalledWith('profiles')
  })
})
