import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    tagline: 'Try it tonight',
    color: 'var(--text-secondary)',
    glow: 'transparent',
    border: 'var(--border)',
    features: [
      '25 cards',
      'Words, Gestures & Dares',
      'Up to 4 players',
      'No account needed',
    ],
    locked: [
      'Cliché, Associations & Persona',
      'Unlimited players',
      'Multiplayer rooms',
    ],
    cta: 'Play Free',
    ctaHref: '/play',
    ctaVariant: 'secondary' as const,
    featured: false,
  },
  {
    name: 'Plus',
    price: '€2.99',
    period: '/month',
    tagline: 'For the real ones',
    color: 'var(--teal)',
    glow: 'var(--teal-glow)',
    border: 'var(--teal)',
    features: [
      'All 200+ cards',
      'All 6 challenge types',
      'Up to 12 players',
      '10 custom cards / month',
      'Game history',
      'Seasonal card packs',
    ],
    locked: ['Multiplayer rooms with guest link'],
    cta: 'Get Plus',
    ctaHref: '/signup',
    ctaVariant: 'primary' as const,
    featured: true,
  },
  {
    name: 'Pro',
    price: '€5.99',
    period: '/month',
    tagline: 'Built for hosts',
    color: 'var(--pink)',
    glow: 'var(--pink-glow)',
    border: 'var(--pink)',
    features: [
      'Everything in Plus',
      'Multiplayer rooms (guest link)',
      'Unlimited custom cards',
      'Create & share card packs',
      'Stats dashboard',
      'No Giglz branding',
    ],
    locked: [],
    cta: 'Get Pro',
    ctaHref: '/signup',
    ctaVariant: 'pink' as const,
    featured: false,
  },
]

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function PricingCards() {
  return (
    <section
      id="pricing"
      className="py-24 px-6"
      style={{ background: 'var(--surface1)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[var(--text-secondary)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Pricing
          </p>
          <h2
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Unlock the full game
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-sm mx-auto">
            Free is genuinely fun. Plus is where the night gets interesting.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col gap-6 relative"
              style={{
                background: plan.featured ? 'var(--surface2)' : 'var(--surface2)',
                border: `1px solid ${plan.featured ? plan.border : 'var(--border)'}`,
                boxShadow: plan.featured ? `0 0 40px ${plan.glow}` : 'none',
              }}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-display font-black tracking-widest"
                  style={{
                    background: 'var(--teal)',
                    color: '#000',
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Plan header */}
              <div>
                <p
                  className="font-display font-black text-xs tracking-[0.2em] uppercase mb-3"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="font-display font-black text-white"
                    style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[var(--text-secondary)] text-sm">{plan.period}</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm">{plan.tagline}</p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)' }} />

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <CheckIcon color={plan.color === 'var(--text-secondary)' ? 'var(--teal)' : plan.color} />
                    {f}
                  </li>
                ))}
                {plan.locked.map(f => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <LockIcon />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.ctaHref} className="mt-auto">
                <Button variant={plan.ctaVariant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[var(--text-muted)] text-xs mt-8">
          Cancel any time. No questions asked.
        </p>
      </div>
    </section>
  )
}
