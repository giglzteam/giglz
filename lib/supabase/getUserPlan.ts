import { createClient } from '@/lib/supabase/server'

export type Plan = 'free' | 'plus' | 'pro'

export async function getUserPlan(): Promise<Plan> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'free'

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan
    if (plan === 'plus' || plan === 'pro') return plan
    return 'free'
  } catch {
    return 'free'
  }
}
