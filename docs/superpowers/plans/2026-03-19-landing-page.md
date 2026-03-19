# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full marketing landing page at `/` — Navbar, Hero, How It Works, Challenge Types, Review Carousel, Pricing Cards, and Footer — replacing the current placeholder.

**Architecture:** Seven focused Server Components in `components/marketing/` (plus one `'use client'` carousel), assembled in `app/page.tsx`. All styling via Tailwind utilities + existing CSS variables. No new dependencies.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, CSS variables from `globals.css`

**Spec:** `docs/superpowers/specs/2026-03-19-landing-page-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/marketing/Navbar.tsx` | Sticky nav, hamburger menu |
| Create | `components/marketing/HeroSection.tsx` | Headline, card mockup, CTAs, glow |
| Create | `components/marketing/HowItWorks.tsx` | 4-step process section |
| Create | `components/marketing/ChallengeTypes.tsx` | 6 challenge type cards |
| Create | `components/marketing/ReviewCarousel.tsx` | Auto-cycling review carousel (`'use client'`) |
| Create | `components/marketing/PricingCards.tsx` | Free/Plus/Pro tier cards |
| Create | `components/marketing/Footer.tsx` | Nav links, copyright, social icons |
| Modify | `app/page.tsx` | Assemble all sections |
| Create | `__tests__/marketing/carousel.test.ts` | Pure logic test for carousel cycling |

---

## Task 1: Navbar

**Files:**
- Create: `components/marketing/Navbar.tsx`

**What it does:** Sticky navigation bar. Desktop: logo left, "Sign In" + "Play Free" right. Mobile: hamburger that toggles a dropdown with both links.

**Note on hamburger:** This needs `useState` for open/closed toggle, so Navbar must be `'use client'`.

- [ ] **Step 1: Create `components/marketing/Navbar.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-black text-teal text-xl tracking-widest">
          GIGLZ
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors min-h-[48px] flex items-center"
          >
            Sign In
          </Link>
          <Link href="/play">
            <Button variant="primary" className="text-sm">Play Free →</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 min-h-[48px] min-w-[48px] items-center justify-center cursor-pointer"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
          <span className="block w-6 h-[2px] bg-[var(--text-primary)] transition-all" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-surface1 border-b border-[var(--border)] px-6 py-4 flex flex-col gap-3">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="min-h-[48px] flex items-center text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link href="/play" onClick={() => setOpen(false)}>
            <Button variant="primary" className="w-full text-sm">Play Free →</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Verify TypeScript — run build check**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors for `Navbar.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/marketing/Navbar.tsx
git commit -m "feat: Navbar component — sticky nav with mobile hamburger"
```

---

## Task 2: HeroSection

**Files:**
- Create: `components/marketing/HeroSection.tsx`

**What it does:** Full-viewport hero with headline, subhead, static GameCard, and two CTAs. Background teal glow effect.

- [ ] **Step 1: Create `components/marketing/HeroSection.tsx`**

```tsx
import { GameCard } from '@/components/game/GameCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 text-center">
      {/* Background glow — z-index:0 so it sits above the section bg but below content via natural stacking */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'var(--teal-glow)',
          filter: 'blur(80px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />

      {/* Content sits above glow via relative + z-index */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">

      {/* Headline */}
      <h1
        className="font-display font-black text-white text-center mb-4"
        style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.1 }}
      >
        Turn Any Party Unforgettable
      </h1>

      {/* Subhead */}
      <p className="text-[var(--text-secondary)] font-medium text-base mb-8 max-w-[480px]">
        No App Store. No Downloads. Click &amp; Play. 200+ cards, 6 challenges.
      </p>

      {/* Card mockup */}
      <div className="w-full max-w-xs mx-auto pointer-events-none mb-8">
        <GameCard cardId={42} />
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/play">
          <Button variant="primary">Play Free →</Button>
        </Link>
        <Button
          variant="secondary"
          className="opacity-40"
          disabled
          title="Coming soon"
          style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
        >
          Get Plus
        </Button>
      </div>
      </div> {/* end relative z-10 content wrapper */}
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/marketing/HeroSection.tsx
git commit -m "feat: HeroSection — headline, card mockup, CTAs, teal glow"
```

---

## Task 3: HowItWorks

**Files:**
- Create: `components/marketing/HowItWorks.tsx`

**What it does:** 4-step visual process. Pure static content — no state, no interactivity.

- [ ] **Step 1: Create `components/marketing/HowItWorks.tsx`**

```tsx
const STEPS = [
  { emoji: '🎲', title: 'Roll the Die',        desc: 'Each die face maps to one of 6 challenge types' },
  { emoji: '🃏', title: 'Draw a Challenge',     desc: 'Flip the card and read it out loud to your team' },
  { emoji: '🗣️', title: 'Your Team Guesses',   desc: 'Timer on — shout out the answer before time runs out' },
  { emoji: '🏆', title: 'First to 10 Wins',    desc: 'Collect cards, crown the champion, play again' },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-6">
      <h2 className="font-display font-black text-white text-3xl text-center mb-12">
        How It Works
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {STEPS.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-teal flex items-center justify-center font-display font-black text-sm"
              style={{ color: '#0d0820' }}
            >
              {i + 1}
            </div>
            <span className="text-4xl">{step.emoji}</span>
            <p className="font-display font-black text-white text-sm">{step.title}</p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/HowItWorks.tsx
git commit -m "feat: HowItWorks — 4-step game process section"
```

---

## Task 4: ChallengeTypes

**Files:**
- Create: `components/marketing/ChallengeTypes.tsx`

**What it does:** 6 challenge type cards in a responsive grid. Colors and text match `DIE_MAP` authoritative values.

- [ ] **Step 1: Create `components/marketing/ChallengeTypes.tsx`**

```tsx
// Text colors per die: die-3 and die-4 use white (#fff), others use dark (#0d0820)
// Source of truth: DIE_TEXT_COLOR in components/ui/Badge.tsx
const CHALLENGES = [
  { die: 1, name: 'Words',        desc: 'Explain without saying the word. No parts, no rhymes, no spelling!', color: '#EA6CAE', textColor: '#0d0820' },
  { die: 2, name: 'Cliché',       desc: 'Describe using only its most famous traits — without naming it!',    color: '#7ADDDA', textColor: '#0d0820' },
  { die: 3, name: 'Associations', desc: 'Give 3 quick associations to lead others to the answer.',             color: '#68519E', textColor: '#ffffff' },
  { die: 4, name: 'Gestures',     desc: 'Act it out — no talking, no sounds!',                                color: '#3097D1', textColor: '#ffffff' },
  { die: 5, name: 'Persona',      desc: 'Read the initials aloud. Players guess the real person.',             color: '#7ADDDA', textColor: '#0d0820' },
  { die: 6, name: 'Dare',         desc: 'Do what the card says. Group decides if completed.',                  color: '#EA6CAE', textColor: '#0d0820' },
] as const

export function ChallengeTypes() {
  return (
    <section className="py-20 px-6 bg-surface1">
      <h2 className="font-display font-black text-white text-3xl text-center mb-12">
        6 Ways to Play
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
        {CHALLENGES.map(({ die, name, desc, color, textColor }) => (
          <div
            key={die}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{
              background: 'var(--surface2)',
              borderLeft: `4px solid ${color}`,
            }}
          >
            {/* Die number badge */}
            <span
              className="font-display font-black text-sm flex items-center justify-center rounded-lg"
              style={{
                width: 28,
                height: 28,
                background: color,
                color: textColor,
                flexShrink: 0,
              }}
            >
              {die}
            </span>
            <p className="font-display font-black text-white text-sm">{name}</p>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/ChallengeTypes.tsx
git commit -m "feat: ChallengeTypes — 6 challenge type cards with die colors"
```

---

## Task 5: ReviewCarousel

**Files:**
- Create: `__tests__/marketing/carousel.test.ts`
- Create: `components/marketing/ReviewCarousel.tsx`

**What it does:** Auto-cycling 3-review carousel with dot navigation. TDD: test the wrap-around cycling logic as a self-contained pure function (no React imports — safe for `testEnvironment: node`).

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/marketing/carousel.test.ts
// Self-contained — no imports. Tests the cycling logic in isolation.

function nextIndex(current: number, total: number): number {
  throw new Error('not implemented')
}

describe('nextIndex', () => {
  it('advances to next index', () => {
    expect(nextIndex(0, 3)).toBe(1)
    expect(nextIndex(1, 3)).toBe(2)
  })

  it('wraps from last to first', () => {
    expect(nextIndex(2, 3)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/max/Documents/GitHub/giglz && npx jest __tests__/marketing/carousel.test.ts --no-coverage 2>&1 | tail -10
```
Expected: FAIL — "not implemented"

- [ ] **Step 3: Implement `nextIndex` in the test file**

Replace the `throw` with:
```ts
function nextIndex(current: number, total: number): number {
  return (current + 1) % total
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd /Users/max/Documents/GitHub/giglz && npx jest __tests__/marketing/carousel.test.ts --no-coverage 2>&1 | tail -5
```
Expected: PASS — 2 tests passing

- [ ] **Step 5: Create `components/marketing/ReviewCarousel.tsx`**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

const REVIEWS = [
  { quote: 'Best party game we\'ve played in years. The challenges had everyone in tears.', name: 'Jamie', city: 'Dublin' },
  { quote: 'Pulled this out at a flat party and we played for 3 hours straight.',            name: 'Sofia', city: 'Amsterdam' },
  { quote: 'Simple to pick up, impossible to put down. The dare cards are brutal.',          name: 'Tom',   city: 'London' },
]

const INTERVAL_MS = 4000

export function ReviewCarousel() {
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const start = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActive(i => (i + 1) % REVIEWS.length)
    }, INTERVAL_MS)
  }

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    start()

    // Pause on hover for pointer (desktop) devices only
    const el = wrapperRef.current
    const isPointer = window.matchMedia('(pointer: fine)').matches
    if (isPointer && el) {
      el.addEventListener('mouseenter', stop)
      el.addEventListener('mouseleave', start)
    }

    return () => {
      stop()
      if (isPointer && el) {
        el.removeEventListener('mouseenter', stop)
        el.removeEventListener('mouseleave', start)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (i: number) => {
    setActive(i)
    start() // restart interval on manual nav
  }

  return (
    <section className="py-20 px-6">
      <h2 className="font-display font-black text-white text-3xl text-center mb-12">
        What Players Say
      </h2>
      <div ref={wrapperRef} className="max-w-xl mx-auto">
        {/* Reviews — all in DOM, toggled by opacity */}
        <div className="relative min-h-[160px]">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="absolute inset-0 flex flex-col items-center text-center gap-4 transition-opacity duration-300"
              style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'auto' : 'none' }}
            >
              <p className="text-yellow-400 text-xl tracking-wide">⭐⭐⭐⭐⭐</p>
              <p className="text-white text-base leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <p className="text-[var(--text-secondary)] text-sm font-semibold">
                {r.name}, {r.city}
              </p>
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to review ${i + 1}`}
              className="w-2 h-2 rounded-full transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full block transition-colors"
                style={{ background: i === active ? 'var(--teal)' : 'var(--border)' }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add __tests__/marketing/carousel.test.ts components/marketing/ReviewCarousel.tsx
git commit -m "feat: ReviewCarousel — auto-cycling 3-review carousel with dot nav"
```

---

## Task 6: PricingCards

**Files:**
- Create: `components/marketing/PricingCards.tsx`

**What it does:** Three-tier pricing grid. Free CTA is enabled (→ `/play`). Plus and Pro CTAs are visually disabled. Feature lists match the implemented app state (`PaywallGate.tsx`).

- [ ] **Step 1: Create `components/marketing/PricingCards.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    badge: { label: 'Start Here', bg: 'var(--teal)', color: '#0d0820' },
    features: ['15 cards', 'All 6 challenge types', 'Up to 4 players', 'Solo play'],
    cta: { label: 'Play Free →', href: '/play', disabled: false },
  },
  {
    name: 'Plus',
    price: '€2.99',
    period: '/mo',
    badge: { label: 'Most Popular', bg: 'var(--pink)', color: '#ffffff' },
    features: ['All 75 cards', 'Team Play mode', 'Up to 12 players', 'Game history'],
    cta: { label: 'Get Plus', href: null, disabled: true },
  },
  {
    name: 'Pro',
    price: '€5.99',
    period: '/mo',
    badge: null,
    features: [
      'Everything in Plus',
      'Multiplayer rooms with guest link',
      'Unlimited custom cards',
      'Create & share card packs',
      'Stats dashboard',
    ],
    cta: { label: 'Get Pro', href: null, disabled: true },
  },
] as const

export function PricingCards() {
  return (
    <section className="py-20 px-6 bg-surface1">
      <h2 className="font-display font-black text-white text-3xl text-center mb-3">
        Simple Pricing
      </h2>
      <p className="text-[var(--text-secondary)] text-center mb-12">
        Start free. Upgrade when you&apos;re hooked.
      </p>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="rounded-3xl p-6 flex flex-col gap-5 border border-[var(--border)]"
            style={{ background: 'var(--surface2)' }}
          >
            {/* Badge */}
            <div className="min-h-[24px]">
              {plan.badge && (
                <span
                  className="inline-flex px-3 py-1 rounded-full text-xs font-bold font-display"
                  style={{ background: plan.badge.bg, color: plan.badge.color }}
                >
                  {plan.badge.label}
                </span>
              )}
            </div>

            {/* Name + price */}
            <div>
              <p className="font-display font-black text-white text-xl">{plan.name}</p>
              <p className="font-display font-black text-white text-3xl mt-1">
                {plan.price}
                {'period' in plan && (
                  <span className="text-sm text-[var(--text-secondary)] font-sans font-normal">
                    {plan.period}
                  </span>
                )}
              </p>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="w-4 h-4 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-[9px] text-teal font-bold shrink-0">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.cta.disabled ? (
              <button
                disabled
                title="Stripe coming soon"
                className="w-full min-h-[48px] rounded-full font-display font-black text-sm border border-[var(--border)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed"
                style={{ pointerEvents: 'none' }}
              >
                {plan.cta.label}
              </button>
            ) : (
              <Link href={plan.cta.href!}>
                <Button variant="primary" className="w-full text-sm">{plan.cta.label}</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/PricingCards.tsx
git commit -m "feat: PricingCards — Free/Plus/Pro tiers, paid CTAs disabled"
```

---

## Task 7: Footer

**Files:**
- Create: `components/marketing/Footer.tsx`

**What it does:** Two-row footer with logo, nav links, copyright, and social icon placeholders.

- [ ] **Step 1: Create `components/marketing/Footer.tsx`**

```tsx
import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.07a8.16 8.16 0 0 0 4.77 1.52V7.15a4.85 4.85 0 0 1-1-.46z" fill="currentColor"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-[var(--border)]" style={{ background: 'var(--surface1)' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Link href="/" className="font-display font-black text-teal text-lg tracking-widest">
            GIGLZ
          </Link>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/play" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[48px] flex items-center">
              Play Free
            </Link>
            <Link href="/login" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[48px] flex items-center">
              Sign In
            </Link>
            <span
              title="Coming soon"
              className="text-[var(--text-muted)] opacity-40 min-h-[48px] flex items-center"
              style={{ cursor: 'not-allowed' }}
            >
              Pricing
            </span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-between">
          <p className="text-[var(--text-secondary)] text-sm">
            © 2026 Giglz. Made for parties.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Follow on Instagram"
              className="text-[var(--text-secondary)] hover:text-teal transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="Follow on TikTok"
              className="text-[var(--text-secondary)] hover:text-teal transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/Footer.tsx
git commit -m "feat: Footer — nav links, copyright, social icon placeholders"
```

---

## Task 8: Assemble app/page.tsx + smoke test

**Files:**
- Modify: `app/page.tsx`

**What it does:** Replace the `<main>Giglz</main>` placeholder with all 7 sections. Run the full test suite + dev server to confirm everything compiles and renders.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import { Navbar } from '@/components/marketing/Navbar'
import { HeroSection } from '@/components/marketing/HeroSection'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ChallengeTypes } from '@/components/marketing/ChallengeTypes'
import { ReviewCarousel } from '@/components/marketing/ReviewCarousel'
import { PricingCards } from '@/components/marketing/PricingCards'
import { Footer } from '@/components/marketing/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <ChallengeTypes />
        <ReviewCarousel />
        <PricingCards />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
cd /Users/max/Documents/GitHub/giglz && npx jest --no-coverage 2>&1 | tail -15
```
Expected: all existing tests pass + the new carousel test passes

- [ ] **Step 3: TypeScript full check**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1
```
Expected: no errors

- [ ] **Step 4: Production build check**

```bash
cd /Users/max/Documents/GitHub/giglz && npm run build 2>&1 | tail -20
```
Expected: build succeeds with no errors (warnings about missing env vars for Supabase are acceptable)

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble landing page — all 7 sections wired up"
```

---

## Verification

After all tasks are committed:

```bash
cd /Users/max/Documents/GitHub/giglz && npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Navbar sticky, logo links to `/`, "Play Free" works, hamburger appears on mobile
- [ ] Hero has headline, card visible, "Play Free" works, "Get Plus" is disabled
- [ ] How It Works shows 4 steps
- [ ] Challenge Types shows 6 color-coded cards
- [ ] Reviews auto-cycle every 4 seconds, dots work
- [ ] Pricing shows 3 tiers, Free CTA works, Plus/Pro CTAs disabled
- [ ] Footer links work, social icons present
