# Phase 2 — Subscriptions Design

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Add Supabase Auth, Stripe subscriptions, a pricing page, and a minimal dashboard so a user can pay €2.99/mo and unlock the full Giglz game. Feature gating in `/play` becomes real (no more hardcoded `isPlusPro = false`).

**Goal:** First paying subscriber.

---

## Architecture

```
User → /pricing → Stripe Checkout → Webhook → Supabase profiles.plan updated
User → /login   → Magic link / Google → /auth/callback → session cookie set
User → /dashboard → reads profile.plan → shows tier + manage link
/play → getUserPlan() server util → real isPlusPro gates card limit + challenge types
```

---

## Files Added / Changed

| File | Change |
|------|--------|
| `app/auth/callback/route.ts` | New — exchanges Supabase auth code for session cookie |
| `app/api/stripe/checkout/route.ts` | New — creates Stripe Checkout session |
| `app/api/stripe/webhook/route.ts` | New — handles subscription lifecycle events |
| `lib/stripe/client.ts` | New — Stripe SDK init (server-only) |
| `lib/stripe/plans.ts` | New — plan definitions (limits, Price IDs, features) |
| `lib/supabase/getUserPlan.ts` | New — server utility: returns 'free' \| 'plus' \| 'pro' |
| `app/(marketing)/pricing/page.tsx` | New — wraps PricingCards, wires CTAs to checkout API |
| `app/dashboard/page.tsx` | New — plan status, manage link, logout |
| `supabase/schema.sql` | New — full DB schema to paste into Supabase SQL editor |
| `.env.local.example` | New — all required env vars documented |
| `app/(game)/play/page.tsx` | Update — isPlusPro from getUserPlan() server call |
| `components/marketing/PricingCards.tsx` | Update — CTAs POST to /api/stripe/checkout |

---

## Database Schema

### `profiles`
Auto-created via trigger on `auth.users` insert.

```sql
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  avatar_emoji      text default '😎',
  plan              text default 'free',
  stripe_customer_id text,
  created_at        timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### `subscriptions`
Written by Stripe webhook only.

```sql
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade,
  stripe_sub_id        text unique,
  plan                 text,
  status               text,
  current_period_end   timestamptz,
  created_at           timestamptz default now()
);
```

### `game_sessions`
Written at end of game. `user_id` is nullable (free/anon games).

```sql
create table game_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete set null,
  players        jsonb,
  winner         text,
  cards_played   int,
  duration_secs  int,
  played_at      timestamptz default now()
);
```

### Row Level Security

```sql
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table game_sessions enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users read own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Anyone can insert game session"
  on game_sessions for insert with check (true);
create policy "Users read own sessions"
  on game_sessions for select using (auth.uid() = user_id);
```

---

## Auth Flow

1. User visits `/login` or `/signup`
2. Calls `supabase.auth.signInWithOtp({ email })` or `signInWithOAuth({ provider: 'google' })`
3. Supabase sends magic link / redirects to Google
4. After auth, redirect to `/auth/callback?code=xxx`
5. `route.ts` calls `supabase.auth.exchangeCodeForSession(code)`
6. Session cookie set, user redirected to `/dashboard`

**`app/auth/callback/route.ts`** — GET handler, uses server Supabase client, redirects to `/dashboard` on success or `/login?error=1` on failure.

---

## Stripe Checkout Flow

```
POST /api/stripe/checkout { plan: 'plus' | 'pro' }
  → verify user session (optional — allow checkout without account)
  → stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PLUS_PRICE_ID, quantity: 1 }],
      success_url: /dashboard?upgraded=true,
      cancel_url: /pricing,
      customer_email: user?.email,
      metadata: { userId: user?.id, plan }
    })
  → return { url } → client redirects to Stripe hosted page
```

**Webhook (`/api/stripe/webhook`)** — verifies `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`, handles:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upsert subscription row, set `profiles.plan` |
| `customer.subscription.updated` | Update status + period end |
| `customer.subscription.deleted` | Set `profiles.plan = 'free'`, update status |

Webhook uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) to update profiles.

---

## `getUserPlan()` Utility

```ts
// lib/supabase/getUserPlan.ts
// Server-only. Returns 'free' | 'plus' | 'pro'.
// Falls back to 'free' if unauthenticated or profile missing.
export async function getUserPlan(): Promise<'free' | 'plus' | 'pro'>
```

Used in:
- `app/(game)/play/page.tsx` — convert to async server component, pass `isPlusPro` prop to client child
- `app/dashboard/page.tsx` — show current plan

---

## Pages

### `/pricing`
- Server component
- Reads current user plan via `getUserPlan()`
- Renders `PricingCards` with `currentPlan` prop
- Active plan tier highlighted, CTA disabled for current plan

### `/dashboard`
Minimal for Phase 2:
- Display name (from profile)
- Current plan badge (Free / Plus / Pro)
- If Plus/Pro: subscription renewal date + "Manage subscription" link (Stripe Customer Portal)
- If Free: upgrade CTA → `/pricing`
- Play button → `/play`
- Log out button → calls `supabase.auth.signOut()`, redirect to `/`

### `/play` update
Convert to hybrid: server component wrapper reads plan, passes `isPlusPro: boolean` to existing client component. No structural changes to game logic.

---

## PricingCards Update

CTA buttons change behaviour:
- "Play Free" → `/play` (unchanged)
- "Get Plus" / "Get Pro" → `POST /api/stripe/checkout` then redirect to returned `url`
- If user not logged in → redirect to `/signup?next=checkout&plan=plus` first

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLUS_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=https://giglz.org
```

---

## Out of Scope (Phase 3+)

- Multiplayer rooms
- Custom card editor
- Game history UI
- Resend email integration
- Stripe customer portal (just a link for now)
