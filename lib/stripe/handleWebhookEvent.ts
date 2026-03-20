import Stripe from 'stripe'
import { SupabaseClient } from '@supabase/supabase-js'

export async function handleWebhookEvent(
  event: Stripe.Event,
  supabase: SupabaseClient,
  stripe: Stripe,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metaUserId = session.metadata?.userId

      const userId = metaUserId
        ? metaUserId
        : await resolveUserIdFromCustomer(session.customer as string, supabase)

      if (!userId) return

      const plan = (session.metadata?.plan ?? 'plus') as 'plus' | 'pro'
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_sub_id: sub.id,
        plan,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_sub_id' })

      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: session.customer as string,
      }).eq('id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('stripe_sub_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      const { data: row } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_sub_id', sub.id)
        .single()

      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_sub_id', sub.id)

      if (row?.user_id) {
        await supabase.from('profiles')
          .update({ plan: 'free' })
          .eq('id', row.user_id)
      }
      break
    }
  }
}

async function resolveUserIdFromCustomer(
  customerId: string,
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id ?? null
}
