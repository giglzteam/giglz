# Phase 2 — Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Supabase Auth + Stripe subscriptions so a user can pay €2.99/mo and unlock the full game.

**Architecture:** Auth callback exchanges Supabase code for a session cookie. Stripe Checkout creates a hosted payment page; the webhook writes subscription state back to Supabase using the service role key. `getUserPlan()` is a server-only utility that reads `profiles.plan` and drives all feature gating.

**Tech Stack:** Next.js 14 App Router, Supabase SSR, Stripe Node SDK, Jest + ts-jest

**Spec:** `docs/superpowers/specs/2026-03-20-phase2-subscriptions-design.md`

---

## File Map

| File | Role |
|------|------|
| `app/auth/callback/route.ts` | Supabase PKCE code exchange → session cookie |
| `lib/stripe/client.ts` | Stripe SDK singleton (server-only) |
| `lib/stripe/plans.ts` | Plan metadata + price IDs |
| `lib/stripe/handleWebhookEvent.ts` | Pure webhook event handler (testable) |
| `lib/supabase/getUserPlan.ts` | Server util → 'free' \| 'plus' \| 'pro' |
| `app/api/stripe/checkout/route.ts` | POST → Stripe Checkout session URL |
| `app/api/stripe/webhook/route.ts` | POST ← Stripe signed events |
| `app/api/stripe/portal/route.ts` | POST → Stripe Customer Portal session URL |
| `components/game/PlayGame.tsx` | Extracted client game (accepts `isPlusPro` prop) |
| `app/(game)/play/page.tsx` | Thin server wrapper — reads plan, renders PlayGame |
| `components/marketing/CheckoutButton.tsx` | Client button — POSTs to checkout API |
| `components/marketing/PricingCards.tsx` | Update CTAs to use CheckoutButton |
| `app/(marketing)/pricing/page.tsx` | Standalone /pricing page |
| `components/dashboard/LogoutButton.tsx` | Client — signs out + redirects |
| `components/dashboard/ManageButton.tsx` | Client — POSTs to portal API + redirects |
| `app/dashboard/page.tsx` | Server — shows plan, renewal, CTAs |
| `supabase/schema.sql` | DB schema to paste into Supabase SQL editor |
| `.env.local.example` | All required env vars |
| `__tests__/stripe/handleWebhookEvent.test.ts` | Webhook handler unit tests |
| `__tests__/supabase/getUserPlan.test.ts` | getUserPlan unit tests |

---

## Task 1: Install Stripe + Auth Callback Route

**Files:**
- Modify: `package.json` (via npm install)
- Create: `app/auth/callback/route.ts`

- [ ] **Install Stripe packages**

```bash
npm install stripe @stripe/stripe-js
```

Expected: `stripe` and `@stripe/stripe-js` appear in `package.json` dependencies.

- [ ] **Create auth callback route**

Create `app/auth/callback/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`)
}
```

- [ ] **Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/auth/callback/route.ts package.json package-lock.json
git commit -m "feat: auth callback route + install stripe"
```

---

## Task 2: DB Schema + Env Example

**Files:**
- Create: `supabase/schema.sql`
- Create: `.env.local.example`

- [ ] **Create supabase/schema.sql**

```bash
mkdir -p supabase
```

Create `supabase/schema.sql`:

```sql
-- profiles: auto-created on signup via trigger
create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  avatar_emoji       text default '😎',
  plan               text default 'free',
  stripe_customer_id text,
  created_at         timestamptz default now()
);

-- subscriptions: written by Stripe webhook only
create table if not exists subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade,
  stripe_sub_id        text unique,
  plan                 text,
  status               text,
  current_period_end   timestamptz,
  created_at           timestamptz default now()
);

-- game_sessions: nullable user_id for anonymous free games
create table if not exists game_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete set null,
  players        jsonb,
  winner         text,
  cards_played   int,
  duration_secs  int,
  played_at      timestamptz default now()
);

-- Auto-create profile row on auth.users insert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles      enable row level security;
alter table subscriptions enable row level security;
alter table game_sessions enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- subscriptions: service role key (webhook) bypasses RLS — no insert/update policy needed
create policy "Users read own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

-- game_sessions: authenticated users cannot spoof another user_id
create policy "Anyone can insert own game session"
  on game_sessions for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own sessions"
  on game_sessions for select using (auth.uid() = user_id);
```

- [ ] **Create .env.local.example**

Create `.env.local.example`:

```env
# Supabase — https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe — https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Stripe Price IDs — https://dashboard.stripe.com/products
STRIPE_PLUS_PRICE_ID=price_
STRIPE_PRO_PRICE_ID=price_

# App
NEXT_PUBLIC_APP_URL=https://giglz.org
```

- [ ] **Commit**

```bash
git add supabase/schema.sql .env.local.example
git commit -m "feat: DB schema and env var template"
```

---

## Task 3: Stripe Library Files

**Files:**
- Create: `lib/stripe/client.ts`
- Create: `lib/stripe/plans.ts`

- [ ] **Create lib/stripe/client.ts**

```ts
import Stripe from 'stripe'

// Use 2024-06-20 — 2025-01-27.acacia removed Subscription.current_period_end
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

- [ ] **Create lib/stripe/plans.ts**

```ts
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
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add lib/stripe/client.ts lib/stripe/plans.ts
git commit -m "feat: Stripe client singleton and plan definitions"
```

---

## Task 4: getUserPlan Utility + Tests

**Files:**
- Create: `lib/supabase/getUserPlan.ts`
- Create: `__tests__/supabase/getUserPlan.test.ts`

- [ ] **Write the failing tests**

Create `__tests__/supabase/getUserPlan.test.ts`:

```ts
// jest.mock is hoisted — use jest.mocked() in beforeEach to configure per-test
jest.mock('@/lib/supabase/server')

import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/supabase/getUserPlan'

const mockGetUser = jest.fn()
const mockFrom = jest.fn()

beforeEach(() => {
  jest.mocked(createClient).mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  } as any)
  jest.clearAllMocks()
})

describe('getUserPlan', () => {

  it('returns "free" when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    expect(await getUserPlan()).toBe('free')
  })

  it('returns "plus" when profile.plan is "plus"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { plan: 'plus' } }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('plus')
  })

  it('returns "pro" when profile.plan is "pro"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { plan: 'pro' } }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('pro')
  })

  it('returns "free" when profile is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
        }),
      }),
    })
    expect(await getUserPlan()).toBe('free')
  })

  it('returns "free" on Supabase error', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'))
    expect(await getUserPlan()).toBe('free')
  })
})
```

- [ ] **Run tests to confirm they fail**

```bash
npx jest __tests__/supabase/getUserPlan.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/supabase/getUserPlan'`

- [ ] **Implement getUserPlan**

Create `lib/supabase/getUserPlan.ts`:

```ts
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
```

- [ ] **Run tests to confirm they pass**

```bash
npx jest __tests__/supabase/getUserPlan.test.ts --no-coverage
```

Expected: PASS (5 tests)

- [ ] **Commit**

```bash
git add lib/supabase/getUserPlan.ts __tests__/supabase/getUserPlan.test.ts
git commit -m "feat: getUserPlan server utility with tests"
```

---

## Task 5: Stripe Checkout Route

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Create checkout route**

```bash
mkdir -p app/api/stripe/checkout
```

Create `app/api/stripe/checkout/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { PLANS, PlanId } from '@/lib/stripe/plans'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = body.plan as PlanId

  if (plan !== 'plus' && plan !== 'pro') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId = PLANS[plan].priceId
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    customer_email: user?.email,
    metadata: {
      userId: user?.id ?? '',
      plan,
    },
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat: Stripe checkout session API route"
```

---

## Task 6: Webhook Event Handler + Tests

**Files:**
- Create: `lib/stripe/handleWebhookEvent.ts`
- Create: `__tests__/stripe/handleWebhookEvent.test.ts`

- [ ] **Write the failing tests**

Create `__tests__/stripe/handleWebhookEvent.test.ts`:

```ts
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
```

- [ ] **Run tests to confirm they fail**

```bash
npx jest __tests__/stripe/handleWebhookEvent.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/stripe/handleWebhookEvent'`

- [ ] **Implement handleWebhookEvent**

Create `lib/stripe/handleWebhookEvent.ts`:

```ts
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
```

- [ ] **Run tests to confirm they pass**

```bash
npx jest __tests__/stripe/handleWebhookEvent.test.ts --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Commit**

```bash
git add lib/stripe/handleWebhookEvent.ts __tests__/stripe/handleWebhookEvent.test.ts
git commit -m "feat: webhook event handler with tests"
```

---

## Task 7: Webhook Route + Portal Route

**Files:**
- Create: `app/api/stripe/webhook/route.ts`
- Create: `app/api/stripe/portal/route.ts`

- [ ] **Create webhook route**

```bash
mkdir -p app/api/stripe/webhook
```

Create `app/api/stripe/webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/client'
import { handleWebhookEvent } from '@/lib/stripe/handleWebhookEvent'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service role key — bypasses RLS for webhook writes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await handleWebhookEvent(event, supabase, stripe)

  return NextResponse.json({ received: true })
}
```

- [ ] **Create portal route**

```bash
mkdir -p app/api/stripe/portal
```

Create `app/api/stripe/portal/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add app/api/stripe/webhook/route.ts app/api/stripe/portal/route.ts
git commit -m "feat: Stripe webhook and customer portal routes"
```

---

## Task 8: Extract PlayGame Client Component

**Files:**
- Create: `components/game/PlayGame.tsx` (extracted from play/page.tsx)
- Modify: `app/(game)/play/page.tsx`

- [ ] **Create PlayGame.tsx**

Create `components/game/PlayGame.tsx` — copy the full content of `app/(game)/play/page.tsx`, then:
1. Rename the export from `PlayPage` to `PlayGame`
2. Add `isPlusPro: boolean` to the props interface
3. Remove the hardcoded `const isPlusPro = false` line
4. Keep all other logic unchanged

```tsx
'use client'
import { useState, useCallback } from 'react'
import { PlayerSetup, GameOptions } from '@/components/game/PlayerSetup'
import { GameCard } from '@/components/game/GameCard'
import { ModeStrip } from '@/components/game/ModeStrip'
import { TimerBar } from '@/components/game/TimerBar'
import { ScoreBar } from '@/components/game/ScoreBar'
import { PaywallGate } from '@/components/game/PaywallGate'
import { WinnerScreen } from '@/components/game/WinnerScreen'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import {
  GameState, CreateGameOptions, createGame, rollDie,
  drawCard, scoreCard, skipCard, nextTurn, checkWin,
} from '@/lib/game/engine'
import { ALL_CARD_IDS, FREE_CARD_LIMIT, DieValue } from '@/lib/game/cards'

interface PlayGameProps { isPlusPro: boolean }

export function PlayGame({ isPlusPro }: PlayGameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)

  const cardLimit = isPlusPro ? ALL_CARD_IDS.length : FREE_CARD_LIMIT

  function handleStart(opts: GameOptions) {
    const cardIds = ALL_CARD_IDS.slice(0, cardLimit)
    const state = createGame({ ...opts, cardIds } as CreateGameOptions)
    setGameState(state)
    setCardCount(0)
    setWinner(null)
    setShowPaywall(false)
  }

  function handleRoll(dieValue: DieValue) {
    if (!gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }
    const withDie: GameState = {
      ...gameState,
      dieValue: gameState.singleTaskMode ? gameState.singleTaskDie : dieValue,
    }
    setGameState(drawCard(withDie))
    setCardCount(c => c + 1)
  }

  function handleRollButton() {
    if (rolling || !gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }
    setRolling(true)
    setTimeout(() => {
      setRolling(false)
      handleRoll(rollDie())
    }, 650)
  }

  function handleCorrect(scoringIndex?: number) {
    if (!gameState) return
    const scored = scoreCard(gameState, scoringIndex)
    const w = checkWin(scored)
    if (w) { setGameState(scored); setWinner(w); return }
    setGameState(nextTurn(scored))
    const isDare = gameState.dieValue === 6
    const name = isDare
      ? (gameState.mode === 'solo'
          ? gameState.players[gameState.currentPlayer]?.name
          : gameState.teams[gameState.currentTeam]?.name)
      : (gameState.mode === 'solo' && scoringIndex !== undefined
          ? gameState.players[scoringIndex]?.name
          : gameState.teams[scoringIndex ?? 0]?.name)
    setToast(`${name} +1 🎉`)
  }

  function handleSkip() {
    if (!gameState) return
    setGameState(nextTurn(skipCard(gameState)))
  }

  const handleTimerExpire = useCallback(() => {
    setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
  }, [])

  if (!gameState) return <PlayerSetup isPlusPro={isPlusPro} onStart={handleStart} />
  if (winner) return (
    <WinnerScreen
      state={gameState}
      winner={winner}
      onPlayAgain={() => handleStart({
        mode: gameState.mode,
        players: gameState.players,
        teams: gameState.teams,
        cardsToWin: gameState.cardsToWin,
        timerEnabled: gameState.timerEnabled,
        singleTaskDie: gameState.singleTaskDie,
      })}
      onNewGame={() => setGameState(null)}
    />
  )

  const isDare = gameState.dieValue === 6
  const currentPlayerName = gameState.mode === 'solo'
    ? gameState.players[gameState.currentPlayer]?.name
    : gameState.teams[gameState.currentTeam]?.players[
        gameState.teams[gameState.currentTeam]?.currentPlayerIndex
      ]

  return (
    <div className="min-h-dvh bg-bg flex flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">
          GiGLz
        </div>
        <button
          onClick={() => setShowPaywall(true)}
          className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5"
        >
          🔓 Unlock All
        </button>
      </div>

      <div className="text-center px-4 pb-2">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
          {gameState.mode === 'teams'
            ? `${gameState.teams[gameState.currentTeam]?.name} — Performer`
            : 'Current Player'}
        </div>
        <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">
          {currentPlayerName}
        </div>
      </div>

      <ModeStrip
        dieValue={gameState.dieValue}
        singleTaskDie={gameState.singleTaskMode ? gameState.singleTaskDie : null}
      />

      <div className="flex-1 px-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <GameCard cardId={gameState.currentCardId} />
        </div>
      </div>

      <TimerBar
        enabled={gameState.timerEnabled && gameState.phase === 'reveal' && !isDare}
        running={gameState.phase === 'reveal'}
        onExpire={handleTimerExpire}
      />
      <ScoreBar state={gameState} />

      <div className="px-4 pt-2 pb-4">
        {gameState.phase === 'rolling' ? (
          <Button
            variant="roll"
            disabled={rolling}
            onClick={handleRollButton}
            className={rolling ? 'opacity-80' : ''}
          >
            <span
              className={rolling ? 'animate-[die-roll_650ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
              style={{ display: 'inline-block' }}
            >
              🎲
            </span>
            &nbsp;{rolling ? 'ROLLING…' : 'ROLL & DRAW'}
          </Button>
        ) : isDare ? (
          <div className="flex gap-3">
            <Button variant="skip" onClick={handleSkip}>Skip →</Button>
            <Button variant="correct" onClick={() => handleCorrect()}>Done ✓</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
              Who guessed it?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {gameState.mode === 'solo'
                ? gameState.players
                    .map((p, i) => ({ ...p, i }))
                    .filter(p => p.i !== gameState.currentPlayer)
                    .map(p => (
                      <Button
                        key={p.i}
                        variant="correct"
                        className="flex-none text-sm px-4"
                        onClick={() => handleCorrect(p.i)}
                      >
                        {p.emoji} {p.name}
                      </Button>
                    ))
                : gameState.teams
                    .map((t, i) => ({ ...t, i }))
                    .filter(t => t.i !== gameState.currentTeam)
                    .map(t => (
                      <Button
                        key={t.i}
                        variant="correct"
                        className="flex-none text-sm px-4"
                        onClick={() => handleCorrect(t.i)}
                      >
                        {t.name}
                      </Button>
                    ))
              }
            </div>
            <Button variant="skip" onClick={handleSkip}>Nobody got it →</Button>
          </div>
        )}
      </div>

      {showPaywall && <PaywallGate onDismiss={() => setShowPaywall(false)} />}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Replace play/page.tsx with thin server wrapper**

Replace full content of `app/(game)/play/page.tsx`:

```tsx
import { getUserPlan } from '@/lib/supabase/getUserPlan'
import { PlayGame } from '@/components/game/PlayGame'

export default async function PlayPage() {
  const plan = await getUserPlan()
  return <PlayGame isPlusPro={plan === 'plus' || plan === 'pro'} />
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Verify dev server still runs**

```bash
npm run dev
```

Navigate to `http://localhost:3000/play` — game should load identically to before.

- [ ] **Commit**

```bash
git add components/game/PlayGame.tsx app/\(game\)/play/page.tsx
git commit -m "feat: extract PlayGame component, wire real isPlusPro from getUserPlan"
```

---

## Task 9: CheckoutButton + PricingCards Update

**Files:**
- Create: `components/marketing/CheckoutButton.tsx`
- Modify: `components/marketing/PricingCards.tsx`

- [ ] **Create CheckoutButton client component**

Create `components/marketing/CheckoutButton.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CheckoutButtonProps {
  plan: 'plus' | 'pro'
  variant: 'primary' | 'pink'
  label: string
  disabled?: boolean
}

export function CheckoutButton({ plan, variant, label, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading || disabled) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <Button variant={variant} className="w-full opacity-60 cursor-default" disabled>
        Current Plan
      </Button>
    )
  }

  return (
    <Button variant={variant} className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading…' : label}
    </Button>
  )
}
```

- [ ] **Update PricingCards to accept currentPlan prop and use CheckoutButton**

Modify `components/marketing/PricingCards.tsx`:

1. Add `import { CheckoutButton } from './CheckoutButton'` at the top
2. Add `interface PricingCardsProps { currentPlan?: 'free' | 'plus' | 'pro' }`
3. Change `export function PricingCards()` to `export function PricingCards({ currentPlan = 'free' }: PricingCardsProps)`
4. Replace the CTA `<Link href={plan.ctaHref}>` block for Plus and Pro plans with `<CheckoutButton>`:

Replace the entire CTA block inside `PLANS.map(...)` with this explicit branch — **replace the entire file's CTA section, do not preserve any existing lines**:

```tsx
{/* CTA — Free stays as a Link; Plus/Pro use CheckoutButton */}
<div className="mt-auto">
  {plan.name === 'Free' ? (
    <Link href="/play">
      <Button variant={plan.ctaVariant as 'secondary'} className="w-full">
        {plan.cta}
      </Button>
    </Link>
  ) : (
    <CheckoutButton
      plan={plan.name.toLowerCase() as 'plus' | 'pro'}
      variant={plan.ctaVariant as 'primary' | 'pink'}
      label={plan.cta}
      disabled={currentPlan === plan.name.toLowerCase()}
    />
  )}
</div>
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add components/marketing/CheckoutButton.tsx components/marketing/PricingCards.tsx
git commit -m "feat: CheckoutButton wired to Stripe checkout API"
```

---

## Task 10: /pricing Page

**Files:**
- Create: `app/(marketing)/pricing/page.tsx`

- [ ] **Create pricing page directory and file**

```bash
mkdir -p "app/(marketing)/pricing"
```

Create `app/(marketing)/pricing/page.tsx`:

```tsx
import { Navbar } from '@/components/marketing/Navbar'
import { PricingCards } from '@/components/marketing/PricingCards'
import { Footer } from '@/components/marketing/Footer'
import { getUserPlan } from '@/lib/supabase/getUserPlan'

export const metadata = {
  title: 'Pricing — Giglz',
  description: 'Unlock all 200+ cards and 6 challenge types. From €2.99/month.',
}

export default async function PricingPage() {
  const currentPlan = await getUserPlan()
  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="text-center px-6 mb-4">
          <h1
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Unlock the full game
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 max-w-sm mx-auto">
            Free is genuinely fun. Plus is where the night gets interesting.
          </p>
        </div>
        <PricingCards currentPlan={currentPlan} />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Verify TypeScript + build**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add "app/(marketing)/pricing/page.tsx"
git commit -m "feat: /pricing standalone page with real plan state"
```

---

## Task 11: Dashboard Client Helpers

**Files:**
- Create: `components/dashboard/LogoutButton.tsx`
- Create: `components/dashboard/ManageButton.tsx`

- [ ] **Create LogoutButton**

```bash
mkdir -p components/dashboard
```

Create `components/dashboard/LogoutButton.tsx`:

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors font-medium"
    >
      Log out
    </button>
  )
}
```

- [ ] **Create ManageButton**

Create `components/dashboard/ManageButton.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function ManageButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleManage} disabled={loading} className="text-sm">
      {loading ? 'Loading…' : 'Manage subscription →'}
    </Button>
  )
}
```

- [ ] **Commit**

```bash
git add components/dashboard/LogoutButton.tsx components/dashboard/ManageButton.tsx
git commit -m "feat: dashboard LogoutButton and ManageButton client components"
```

---

## Task 12: /dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Create dashboard page**

Create `app/dashboard/page.tsx`:

```tsx
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
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Test dev server**

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard` — should redirect to `/login` when not authenticated.

- [ ] **Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: /dashboard page with plan badge, renewal date, and manage/upgrade CTAs"
```

---

## Task 13: Run All Tests + Final Build Check

- [ ] **Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass including pre-existing engine/cards tests.

- [ ] **Final build**

```bash
npm run build
```

Expected: only `/login` and `/signup` show prerender errors (Supabase env vars not set). All other pages build cleanly.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 complete — Supabase auth + Stripe subscriptions

- Auth callback route (code exchange → session cookie)
- Stripe checkout, webhook, and customer portal routes
- handleWebhookEvent handles checkout, update, delete events
- getUserPlan() server utility drives all feature gating in /play
- /pricing standalone page with real plan state
- /dashboard with plan badge, renewal date, logout, manage
- DB schema SQL + env example

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Setup Instructions (After Code Is Deployed)

1. **Paste `supabase/schema.sql`** into Supabase SQL editor and run
2. **Copy `.env.local.example` → `.env.local`** and fill in all values
3. **Stripe webhook**: In Stripe Dashboard → Webhooks → Add endpoint:
   - URL: `https://giglz.org/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`
4. **Test locally with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```
