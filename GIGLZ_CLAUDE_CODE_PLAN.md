# GIGLZ — Claude Code Build Plan
> Complete specification for rebuilding Giglz as a standalone web app on giglz.org
> Feed this file to Claude Code as your project brief.

---

## 1. Project Overview

**What we're building:** A standalone Next.js web app at `giglz.org` that replaces the Shopify-embedded game. It includes the full Giglz party game, a freemium subscription model via Stripe, real-time multiplayer rooms, and a custom card editor.

**Core product promise:** "No App Store. No Downloads. Click & Play." — the host opens a link on their phone, guests join instantly. Zero friction at a party.

**Stack decision rationale:**
- No more Shopify dependency (was built for physical products)
- Full control of game UI and UX
- Stripe handles subscriptions directly → you keep 97% of revenue
- Vercel hosting → ~€0/mo until significant scale
- PWA support → "Add to home screen" feels like a native app without the 30% Apple cut

---

## 2. Tech Stack

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS + CSS variables for brand tokens
Database:      Supabase (Postgres + Auth + Realtime)
Payments:      Stripe (subscriptions + one-time)
Realtime:      Supabase Realtime (multiplayer rooms)
Hosting:       Vercel (free tier to start)
Domain:        giglz.org (keep existing)
Email:         Resend (transactional emails)
PWA:           next-pwa
```

**Why Supabase over Firebase:** Postgres is more flexible for game state, built-in Auth, and the Realtime feature handles multiplayer room sync perfectly. Free tier covers ~500 active users.

---

## 3. Brand Identity & Design System

### 3.1 Visual Direction
Giglz is a **bold, high-energy party game** for students and young adults (18–28). The aesthetic should feel like a premium party wristband — dark, confident, playful without being childish. Think: late-night energy, neon accents on black, the confidence of a brand that's been at 1,000 parties.

**Aesthetic keywords:** Dark maximalist, bold typography, neon-on-black, tactile card feel, fast animations.

**Anti-patterns to avoid:** Pastel SaaS look, corporate blues, generic rounded buttons, anything that looks like a quiz app.

### 3.2 Color Tokens

```css
:root {
  /* Brand core */
  --color-bg:           #0A0A0F;   /* near-black, site background */
  --color-surface:      #13131A;   /* card & panel surfaces */
  --color-surface-2:    #1C1C27;   /* elevated surfaces */
  --color-border:       #2A2A3A;   /* subtle borders */

  /* Brand accent — Giglz yellow/gold */
  --color-accent:       #F5C842;   /* primary CTA, highlights */
  --color-accent-dim:   #C9A235;   /* hover state */
  --color-accent-glow:  rgba(245, 200, 66, 0.15); /* glow effects */

  /* Challenge type colors — one per card type */
  --color-words:        #4ECDC4;   /* teal */
  --color-cliche:       #FF6B9D;   /* pink */
  --color-associations: #A78BFA;   /* purple */
  --color-gestures:     #F97316;   /* orange */
  --color-persona:      #22D3EE;   /* cyan */
  --color-dares:        #EF4444;   /* red */

  /* Text */
  --color-text-primary:   #FFFFFF;
  --color-text-secondary: #A0A0B8;
  --color-text-muted:     #5A5A78;
}
```

### 3.3 Typography

```css
/* Display font — bold, party energy */
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&display=swap');

/* Body font — clean, readable on phones */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

--font-display: 'Unbounded', sans-serif;   /* headings, game card titles, CTAs */
--font-body:    'DM Sans', sans-serif;      /* UI text, descriptions */
```

### 3.4 Logo
Use existing logo from: `https://giglz.org/cdn/shop/files/Logo_Transp.png`
Download and host locally at `/public/logo.png`.

### 3.5 Card Design
Each card is a dark rounded rectangle with:
- Challenge type badge (color-coded, top-left)
- Die number indicator (1–6, top-right)
- Card content (large, bold, centered)
- Subtle texture/noise overlay for tactile feel

The 6 challenge type colors map to die faces:
```
1 = Words        → --color-words       (#4ECDC4)
2 = Cliché       → --color-cliche      (#FF6B9D)
3 = Associations → --color-associations (#A78BFA)
4 = Gestures     → --color-gestures    (#F97316)
5 = Persona      → --color-persona     (#22D3EE)
6 = Dares        → --color-dares       (#EF4444)
```

---

## 4. Project Structure

```
giglz/
├── app/
│   ├── (marketing)/          # Public pages
│   │   ├── page.tsx          # Landing page
│   │   ├── pricing/page.tsx  # Pricing page
│   │   └── layout.tsx
│   ├── (game)/               # Game pages
│   │   ├── play/page.tsx     # Free game (25 cards, solo)
│   │   ├── room/
│   │   │   ├── [code]/page.tsx   # Join a room by code
│   │   │   └── new/page.tsx      # Create a room (Plus/Pro)
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/page.tsx     # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx              # User dashboard
│   │   ├── cards/page.tsx        # Custom card editor
│   │   └── history/page.tsx      # Game history
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhook/route.ts
│   │   └── room/
│   │       ├── create/route.ts
│   │       └── join/route.ts
│   └── layout.tsx                # Root layout, fonts, metadata
├── components/
│   ├── game/
│   │   ├── GameCard.tsx          # The card component (core UI)
│   │   ├── Die.tsx               # Animated die roll
│   │   ├── PlayerList.tsx        # Sidebar player scores
│   │   ├── ScoreBoard.tsx        # Win screen
│   │   ├── ChallengeReveal.tsx   # Card flip animation
│   │   └── RoomLobby.tsx         # Waiting room UI
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx             # Challenge type badge
│   │   ├── Modal.tsx
│   │   ├── PaywallGate.tsx       # Locked feature overlay
│   │   └── Avatar.tsx            # Player avatar (emoji-based)
│   └── marketing/
│       ├── HeroSection.tsx
│       ├── PricingCards.tsx
│       └── ReviewCarousel.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── stripe/
│   │   ├── client.ts
│   │   └── plans.ts              # Plan definitions
│   ├── game/
│   │   ├── cards.ts              # Card data + types
│   │   ├── engine.ts             # Game state logic
│   │   └── room.ts               # Room management
│   └── utils.ts
├── data/
│   └── cards.json                # Full card deck (200+ cards)
├── public/
│   ├── logo.png
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons
├── styles/
│   └── globals.css               # CSS variables + base styles
└── middleware.ts                 # Next.js middleware (auth guards)
```

---

## 5. Database Schema (Supabase)

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id          uuid primary key references auth.users(id),
  display_name text,
  avatar_emoji text default '😎',
  plan        text default 'free',         -- 'free' | 'plus' | 'pro'
  stripe_customer_id text,
  created_at  timestamptz default now()
);

-- Subscriptions
create table subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  stripe_sub_id   text unique,
  plan            text,                     -- 'plus' | 'pro'
  status          text,                     -- 'active' | 'canceled' | 'past_due'
  current_period_end timestamptz,
  created_at      timestamptz default now()
);

-- Game rooms (multiplayer)
create table rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,         -- 6-char join code e.g. "GIGLZ7"
  host_id     uuid references profiles(id),
  status      text default 'lobby',         -- 'lobby' | 'playing' | 'finished'
  settings    jsonb default '{}',           -- max_players, card_pack, etc.
  state       jsonb default '{}',           -- current game state
  created_at  timestamptz default now(),
  expires_at  timestamptz default now() + interval '4 hours'
);

-- Room players
create table room_players (
  room_id     uuid references rooms(id) on delete cascade,
  player_name text not null,
  player_emoji text default '🎮',
  score       int default 0,
  joined_at   timestamptz default now(),
  primary key (room_id, player_name)
);

-- Custom cards (Plus/Pro)
create table custom_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  content     text not null,
  type        text not null,               -- challenge type
  is_public   boolean default false,
  created_at  timestamptz default now()
);

-- Game history
create table game_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  room_id     uuid references rooms(id),
  players     jsonb,                        -- snapshot of player scores
  winner      text,
  cards_played int,
  duration_seconds int,
  played_at   timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table custom_cards enable row level security;
alter table game_sessions enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users manage own cards" on custom_cards for all using (auth.uid() = user_id);
```

---

## 6. Card Data Structure

```typescript
// lib/game/cards.ts

export type ChallengeType =
  | 'words'        // die: 1 — explain the word without saying it
  | 'cliche'       // die: 2 — complete the well-known phrase
  | 'associations' // die: 3 — say words that associate with the topic
  | 'gestures'     // die: 4 — mime/act it out, no talking
  | 'persona'      // die: 5 — act as a character/stereotype
  | 'dares'        // die: 6 — physical dare/action

export interface Card {
  id: string
  content: string          // the word, phrase, or dare
  type: ChallengeType
  die: 1 | 2 | 3 | 4 | 5 | 6
  tier: 'free' | 'plus'   // 'free' = available without subscription
  tags?: string[]          // e.g. ['office', 'uni', 'adult']
}

// FREE tier: 25 cards (a few of each type)
// PLUS tier: 200+ cards (full deck)
// PRO tier: 200+ cards + ability to add custom cards + themed packs
```

---

## 7. Game Logic (engine.ts)

```typescript
// lib/game/engine.ts

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  deck: Card[]           // shuffled deck
  drawnCard: Card | null
  dieValue: number | null
  phase: 'setup' | 'rolling' | 'reveal' | 'scoring' | 'finished'
  winner: Player | null
  cardsToWin: number     // default: 10
}

export interface Player {
  name: string
  emoji: string
  score: number
  isHost?: boolean
}

// Core game flow:
// 1. setup    → players added, deck shuffled
// 2. rolling  → current player taps "Roll & Draw"
//               die value (1-6) maps to challenge type
//               card drawn from filtered deck (type = die face)
// 3. reveal   → card flipped, 60-second timer starts
//               team guesses → host taps "Correct" or "Skip"
// 4. scoring  → +1 card to current player if correct
//               check if score >= cardsToWin → finished
//               else → next player, back to rolling
// 5. finished → winner screen, share/play again options

export function createGame(players: Player[], cards: Card[]): GameState { ... }
export function rollDie(): number { ... }                    // 1-6
export function drawCard(state: GameState): GameState { ... }
export function scorePoint(state: GameState): GameState { ... }
export function skipCard(state: GameState): GameState { ... }
export function nextPlayer(state: GameState): GameState { ... }
export function checkWinner(state: GameState): Player | null { ... }
```

---

## 8. Stripe Subscription Plans

```typescript
// lib/stripe/plans.ts

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '25 cards',
      '3 challenge types (Words, Gestures, Dares)',
      'Up to 4 players',
      'Solo mode only'
    ],
    limits: {
      cards: 25,
      challengeTypes: ['words', 'gestures', 'dares'],
      maxPlayers: 4,
      customCards: 0,
      rooms: false
    }
  },
  plus: {
    name: 'Plus',
    price: 2.99,
    stripePriceId: process.env.STRIPE_PLUS_PRICE_ID,
    features: [
      'All 200+ cards',
      'All 6 challenge types',
      'Up to 12 players',
      '10 custom cards/month',
      'Game history',
      'Seasonal packs'
    ],
    limits: {
      cards: 'all',
      challengeTypes: 'all',
      maxPlayers: 12,
      customCards: 10,
      rooms: false          // rooms = Pro feature
    }
  },
  pro: {
    name: 'Pro',
    price: 5.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Everything in Plus',
      'Multiplayer rooms (guest link)',
      'Unlimited custom cards',
      'Create & share card packs',
      'No Giglz branding option',
      'Stats dashboard'
    ],
    limits: {
      cards: 'all',
      challengeTypes: 'all',
      maxPlayers: 'unlimited',
      customCards: 'unlimited',
      rooms: true
    }
  }
}
```

---

## 9. Key Pages & Screens

### 9.1 Landing Page (`/`)
Re-build the Shopify landing page as a proper Next.js page. Keep the messaging that works ("Turn home party into an unforgettable night") but strip out all the shop/cart UI. Replace "Buy Now" CTAs with "Play Free" and "Unlock Everything".

Sections:
1. Hero — bold headline, animated card preview, two CTAs (Play Free / Get Plus)
2. How it works — 4-step visual (teams → roll → 6 challenges → win)
3. Challenge types — 6 cards, one per type, color-coded
4. Reviews — carousel (reuse existing 5-star reviews)
5. Pricing — three-tier cards (Free / Plus / Pro)
6. Footer — social links, legal

### 9.2 Free Game (`/play`)
The free game. No login required. 25 cards, 3 challenge types, max 4 players.

Layout (mobile-first, full viewport):
- Top bar: Giglz logo + "Unlock All" button (accent color)
- Player setup: name inputs with emoji picker, add/remove players
- Main area: the card (large, centered, takes 60% of screen)
- Die: animated roll below the card
- Bottom bar: current player name + score mini-display
- Paywall gate: shown when user hits a locked feature

### 9.3 Room Lobby (`/room/new` and `/room/[code]`)
**Pro feature.** Host creates a room, gets a 6-character code and a shareable link. Guests open the link on their phone — no signup, no download, they just enter their name and join.

Host screen:
- Room code displayed large (e.g. "GIGLZ7")
- QR code for the room link
- List of players who've joined (live-updating via Supabase Realtime)
- "Start Game" button (only host can press)

Guest screen:
- Enter your name + pick emoji
- Wait in lobby, see other players appear
- Game starts when host presses Start

### 9.4 Game Screen (shared, works for solo and room)
The actual game. Same layout for solo and multiplayer — in multiplayer, all players see the same card on their own phones, and the host controls progression (Correct / Skip / Next).

Components:
- `<GameCard />` — the card, large, with flip animation on reveal
- `<Die />` — 3D CSS die that rolls with animation on tap
- `<PlayerList />` — collapsible sidebar showing scores
- Timer bar — 60-second countdown shown as a shrinking bar
- Action buttons — "Correct ✓" (green) and "Skip →" (gray)

### 9.5 Dashboard (`/dashboard`)
Only for logged-in Plus/Pro users.

Tabs:
- Overview: current plan, games played, favourite challenge type
- Custom Cards: card editor (textarea + type selector + preview)
- Game History: past games, scores, who won

### 9.6 Pricing Page (`/pricing`)
Clean three-column layout. Free / Plus (€2.99) / Pro (€5.99). Clicking "Get Plus" or "Get Pro" opens Stripe Checkout in a new tab or modal.

---

## 10. Multiplayer Architecture (Supabase Realtime)

```
Host device                    Supabase Realtime            Guest devices
    |                                  |                          |
    | create room (code: GIGLZ7)       |                          |
    |--------------------------------->|                          |
    |                                  |                          |
    |                                  |<-- join room (name) -----|
    |                                  |<-- join room (name) -----|
    |<-- broadcast: players updated ---|                          |
    |                                  |                          |
    | start game                       |                          |
    |--------------------------------->|                          |
    |                                  |--- broadcast: game state->|
    |                                  |                          |
    | roll die → draw card             |                          |
    |--------------------------------->|                          |
    |                                  |--- broadcast: card ------>|
    |                                  |   (all see same card)    |
    |                                  |                          |
    | tap "Correct"                    |                          |
    |--------------------------------->|                          |
    |                                  |--- broadcast: score  ---->|
    |                                  |--- broadcast: next player>|
```

Implementation:
- One Supabase Realtime channel per room, named by room code
- Game state stored in `rooms.state` (JSONB)
- Only the host writes state; guests subscribe and render
- Guest-link flow: `/room/GIGLZ7` → enter name → join (no auth required)

---

## 11. Paywall Gates

Create a reusable `<PaywallGate>` component that wraps any locked feature:

```tsx
// Usage example
<PaywallGate feature="teams" requiredPlan="plus">
  <TeamsSetup />
</PaywallGate>

// Shows a dark overlay with:
// - Feature name + what you get
// - "Unlock Plus — €2.99/mo" button → Stripe Checkout
// - "Continue Free" link
```

Locked features by tier:
```
Free → Plus:
  - Challenge types: Cliché, Associations, Persona (3 of 6 locked)
  - Player count > 4
  - Card deck beyond 25 cards
  - Game history

Plus → Pro:
  - Multiplayer rooms with guest link
  - Custom card editor (unlimited)
  - Create & share card packs
  - Remove Giglz branding
```

---

## 12. PWA Configuration

```json
// public/manifest.json
{
  "name": "Giglz",
  "short_name": "Giglz",
  "description": "The #1 Party Game for Students & House Parties",
  "start_url": "/play",
  "display": "standalone",
  "background_color": "#0A0A0F",
  "theme_color": "#F5C842",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

This makes the "Add to Home Screen" prompt appear on iOS/Android. Users get a native-app-like experience with your icon on their home screen, no app store required.

---

## 13. Environment Variables

```env
# .env.local

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
RESEND_API_KEY=
```

---

## 14. Build Order (Phases)

### Phase 1 — Core Game (Week 1–2)
**Goal:** Standalone game at giglz.org, better than what's on Shopify today.

1. `npx create-next-app@latest giglz --typescript --tailwind --app`
2. Set up CSS variables (brand tokens from Section 3.2)
3. Install fonts (Unbounded + DM Sans)
4. Build `<GameCard />` component with flip animation
5. Build `<Die />` component with CSS 3D roll animation
6. Implement game engine (`lib/game/engine.ts`)
7. Import all card data into `data/cards.json`
8. Build `/play` page — free game, 25 cards, no auth
9. Build `<PaywallGate />` component
10. Build landing page `/` — keep Shopify copy, new design
11. Configure PWA (manifest + next-pwa)
12. Deploy to Vercel, point giglz.org DNS

**Done = the free game works better than the current Shopify version.**

### Phase 2 — Subscriptions (Week 3)
**Goal:** First paying subscriber.

1. Set up Supabase project + run schema migrations
2. Configure Supabase Auth (email + Google OAuth)
3. Set up Stripe products (Plus €2.99, Pro €5.99)
4. Build `/api/stripe/checkout` route
5. Build `/api/stripe/webhook` route (update `subscriptions` table)
6. Build `/pricing` page
7. Add login/signup pages
8. Gate locked features behind `<PaywallGate />`
9. Build basic `/dashboard` (plan info + logout)

**Done = someone can pay €2.99 and unlock the full game.**

### Phase 3 — Multiplayer Rooms (Week 4–5)
**Goal:** The viral loop — host invites friends via link.

1. Set up Supabase Realtime
2. Build room creation (`/api/room/create`)
3. Build `/room/new` — host setup screen with QR code
4. Build `/room/[code]` — guest join screen (no auth)
5. Sync game state via Realtime channel
6. Build `<RoomLobby />` component
7. Test with 2+ devices

**Done = a Pro user can host a room and friends join with a link.**

### Phase 4 — Polish & Growth (Week 6+)
1. Custom card editor in `/dashboard/cards`
2. Game history in `/dashboard/history`
3. Seasonal card packs (Halloween, Christmas, Office, etc.)
4. Share results screen (screenshot-friendly, Instagram/TikTok bait)
5. SEO optimisation (party game keywords, student cities)
6. TikTok pixel + basic analytics (Plausible or Posthog)
7. Email capture on free game completion → drip to upsell Plus

---

## 15. Key Commands

```bash
# Initial setup
npx create-next-app@latest giglz --typescript --tailwind --app
cd giglz
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js next-pwa resend

# Supabase CLI
npx supabase init
npx supabase db push        # run schema migrations

# Dev
npm run dev

# Deploy
vercel --prod
```

---

## 16. Animations & Micro-interactions

These make the game feel alive. Implement with CSS keyframes (no library needed):

```css
/* Card flip reveal */
@keyframes cardFlip {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

/* Die roll */
@keyframes dieRoll {
  0%   { transform: rotate(0deg) scale(1); }
  25%  { transform: rotate(180deg) scale(1.1); }
  75%  { transform: rotate(540deg) scale(0.95); }
  100% { transform: rotate(720deg) scale(1); }
}

/* Score +1 pop */
@keyframes scorePop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); color: var(--color-accent); }
  100% { transform: scale(1); }
}

/* Timer bar */
@keyframes timerDrain {
  from { width: 100%; background: var(--color-accent); }
  to   { width: 0%;   background: var(--color-dares); }
}

/* Card entrance */
@keyframes cardIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}
```

---

## 17. Mobile-First Design Rules

Giglz is played on phones at parties. Every screen must work perfectly at 390px width (iPhone 14).

- Minimum tap target: 48px height
- Game card: minimum 320px × 200px
- Die button: minimum 80px × 80px (thumb-sized)
- Font sizes: card content minimum 28px (readable across a table)
- No hover-only states — everything must work with touch
- Safe area insets: `padding: env(safe-area-inset-bottom)` on bottom bars
- Landscape mode: game should reflow gracefully (side-by-side card + players)

---

## 18. SEO & Metadata

```tsx
// app/layout.tsx
export const metadata = {
  title: 'Giglz — The #1 Party Game for Students & House Parties',
  description: 'No App Store. No Downloads. Click & Play. 200+ cards, 6 challenges. The party game designed to break the ice in under 8 minutes.',
  keywords: ['party game', 'drinking game', 'student game', 'house party game', 'flatmate game', 'online party game'],
  openGraph: {
    title: 'Giglz — Turn Any Party Unforgettable',
    description: 'Click & play party game. No downloads. Works on any phone.',
    url: 'https://giglz.org',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  }
}
```

---

## 19. Notes for Claude Code

- **Always mobile-first.** Test every component at 390px before 1440px.
- **The card is the hero.** The `<GameCard />` component should get the most design attention — it's what players stare at during the game.
- **Keep the free game fun.** Don't make free so bad it repels users. Make it genuinely fun but leave clear, natural upgrade moments.
- **Paywall timing matters.** Show the paywall gate after the player has had fun (e.g. after card 20 of 25, not immediately).
- **The guest link is the viral loop.** Make `/room/[code]` the most polished screen in the app — it's what non-users see first.
- **Supabase Realtime can be flaky on mobile networks.** Add a reconnect handler and a visible "Reconnecting..." state.
- **Don't over-engineer Phase 1.** The free game doesn't need a database at all — pure client-side state is fine for Phase 1.
