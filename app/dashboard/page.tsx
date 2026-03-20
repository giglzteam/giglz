import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { ManageButton } from '@/components/dashboard/ManageButton'

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:  { label: 'Free',  color: 'var(--text-secondary)' },
  plus:  { label: 'Plus',  color: 'var(--teal)' },
  pro:   { label: 'Pro',   color: 'var(--pink)' },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, plan, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan ?? 'free') as 'free' | 'plus' | 'pro'
  const name = profile?.display_name ?? user.email?.split('@')[0] ?? 'there'
  const planMeta = PLAN_LABELS[plan]

  let renewalDate: string | null = null
  if (plan !== 'free') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub?.current_period_end) {
      renewalDate = new Date(sub.current_period_end).toLocaleDateString('en-IE', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-8">
        <span className="font-display font-black text-xl bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">
          GiGLz
        </span>
        <LogoutButton />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6"
        style={{
          background: 'var(--surface1)',
          border: '1px solid var(--border)',
        }}
      >
        {searchParams.upgraded && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-center"
            style={{ background: 'var(--teal-glow)', color: 'var(--teal)', border: '1px solid var(--teal)44' }}
          >
            🎉 You&apos;re on {planMeta.label}! Let&apos;s play.
          </div>
        )}

        <div>
          <p className="text-[var(--text-secondary)] text-sm mb-1">Hey, {name} 👋</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl text-white">Your Plan</h1>
            <span
              className="font-display font-black text-xs tracking-widest px-3 py-1 rounded-full"
              style={{
                color: planMeta.color,
                background: `${planMeta.color}22`,
                border: `1px solid ${planMeta.color}44`,
              }}
            >
              {planMeta.label.toUpperCase()}
            </span>
          </div>
          {renewalDate && (
            <p className="text-[var(--text-muted)] text-xs mt-1">Renews {renewalDate}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {plan !== 'free' && profile?.stripe_customer_id ? (
            <ManageButton />
          ) : (
            <Link href="/pricing">
              <Button variant="primary" className="w-full">Upgrade to Plus →</Button>
            </Link>
          )}
          <Link href="/play">
            <Button variant="secondary" className="w-full">Play →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
