# Giglz — Design Specification
**Date:** 2026-03-19
**Status:** Approved
**Scope:** Full 4-phase build — Core Game + Auth + Subscriptions + Multiplayer + Polish

---

## 1. Project Overview

**What we're building:** A standalone Next.js web app at `giglz.org` replacing the Shopify-embedded game. A freemium party game with real PNG card display, Stripe subscriptions, Supabase auth, and optional multiplayer rooms.

**Core product promise:** "No App Store. No Downloads. Click & Play." — one phone passed around the table. Zero friction at a party.

**Approach:** B — Solid Foundation First. Supabase auth set up in Phase 1, Stripe in Phase 2. No auth rework needed between phases.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | + CSS variables for brand tokens |
| Database & Auth | Supabase | Postgres + Auth + Realtime (Phase 3) |
| Payments | Stripe | Subscriptions Phase 2 |
| Hosting | Vercel | Free tier to start |
| PWA | next-pwa | "Add to home screen" on iOS/Android |
| Email | Resend | Transactional emails Phase 2 |
| Fonts | Unbounded + DM Sans | Via Google Fonts |

---

## 3. Brand & Design System

### 3.1 Colour Tokens

```css
:root {
  /* Brand core */
  --purple:       #68519E;
  --purple-deep:  #4a3a72;
  --purple-glow:  rgba(104,81,158,0.35);
  --teal:         #7ADDDA;
  --teal-dim:     #5bbbb8;
  --teal-glow:    rgba(122,221,218,0.3);
  --pink:         #EA6CAE;
  --pink-glow:    rgba(234,108,174,0.3);
  --blue:         #3097D1;
  --blue-glow:    rgba(48,151,209,0.3);

  /* Surfaces */
  --bg:           #0d0820;
  --surface-1:    #160f2e;
  --surface-2:    #1e1640;
  --surface-3:    #281d54;
  --border:       rgba(122,221,218,0.12);
  --border-hover: rgba(122,221,218,0.28);

  /* Text */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255,255,255,0.6);
  --text-muted:     rgba(255,255,255,0.3);

  /* Die colours (consistent across all cards) */
  --die-1: #EA6CAE;  /* words      — pink   */
  --die-2: #7ADDDA;  /* cliché     — teal   */
  --die-3: #68519E;  /* assoc.     — purple */
  --die-4: #3097D1;  /* gestures   — blue   */
  --die-5: #7ADDDA;  /* persona    — teal   */
  --die-6: #EA6CAE;  /* dares      — pink   */
}
```

### 3.2 Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=DM+Sans:wght@400;500;600&display=swap');

--font-display: 'Unbounded', sans-serif;  /* headings, labels, CTAs, die numbers */
--font-body:    'DM Sans', sans-serif;     /* UI text, descriptions, inputs */
```

**Type scale:**
- Display: Unbounded 900, 32–36px — hero headlines
- Heading: Unbounded 700, 20–22px — section titles, player name
- Label: Unbounded 900, 12px, 0.12em tracking, uppercase — challenge type, badges
- Body: DM Sans 500, 15px, 1.6 line-height — descriptions, mode explanations
- Caption: DM Sans 400, 12px — secondary info, timestamps

### 3.3 Style Direction

**Aesthetic:** Dark maximalist with vibrant brand accents. Deep purple-dark backgrounds, neon glow effects on interactive elements, bold Unbounded typography. Tactile card feel with subtle noise texture overlay.

**Style classification:** Vibrant & Block-based — bold geometric layouts, high colour contrast, large typography, animated interactions.

**Anti-patterns to avoid:** Pastel SaaS look, corporate blues, anything that looks like a quiz app, Inter/Roboto fonts.

---

## 4. Card System

### 4.1 Key Decision: PNG Cards

The 75 card PNG images (numbered `26.png` to `100.png` in `/public/cards/`) **are** the cards. No text database is needed. Players read challenge content from the card image.

**File naming:** `/public/cards/{number}.png` — numbers 26–100 (note: `" 60 .png"` has a space and needs renaming to `60.png`).

### 4.2 Die → Challenge Type Mapping

Consistent across all 75 cards:

```typescript
export const DIE_MAP = {
  1: { type: 'words',        label: 'Words',        desc: 'Explain without saying the word',       color: '#EA6CAE' },
  2: { type: 'cliche',       label: 'Cliché',       desc: 'Complete the well-known phrase',        color: '#7ADDDA' },
  3: { type: 'associations', label: 'Associations', desc: 'Say words that relate to the topic',    color: '#68519E' },
  4: { type: 'gestures',     label: 'Gestures',     desc: 'Act it out — no talking!',              color: '#3097D1' },
  5: { type: 'persona',      label: 'Persona',      desc: 'Act as the character or celebrity',     color: '#7ADDDA' },
  6: { type: 'dares',        label: 'Dares',        desc: 'Complete the dare!',                    color: '#EA6CAE' },
} as const
```

### 4.3 Card Display (Option B — Clean card + mode strip)

The full card PNG is displayed without any overlay. The **mode strip above the card** is the sole indicator of which challenge was rolled — showing the die number badge, challenge name, and explanation. The card image is shown clean.

---

## 5. Game Logic

### 5.1 Game State (Client-side only in Phase 1 — no database)

```typescript
type GameMode = 'solo' | 'teams'

interface Team {
  name: string           // "Team 1", "Team 2", etc.
  players: string[]      // player names on this team
  score: number
  currentPlayerIndex: number  // rotates clockwise within team each turn
}

interface GameState {
  mode:           GameMode
  players:        { name: string; emoji: string; score: number }[]  // solo
  teams:          Team[]                    // team mode (Plus/Pro)
  currentTeam:    number                    // team mode: index of team whose turn it is
  currentPlayer:  number                    // solo mode: index into players[]
  deck:           number[]                  // Fisher-Yates shuffled card IDs (no repeats)
  deckIndex:      number                    // advances each turn; auto-reshuffles at end
  dieValue:       1 | 2 | 3 | 4 | 5 | 6 | null  // fully random each roll
  phase:          'setup' | 'rolling' | 'reveal' | 'scoring' | 'finished'
  timerEnabled:   boolean                   // optional 60s timer, toggled in setup
  timerSeconds:   number                    // countdown from 60
  cardsToWin:     number                    // default 10, user-adjustable
  singleTaskMode: boolean                   // optional: ignore die, fixed challenge type
  singleTaskDie:  1 | 2 | 3 | 4 | 5 | 6 | null
}
```

### 5.2 Setup Options

Before the game starts, players configure:
- **Game mode:** Solo or Team Play (Plus/Pro)
- **Players / Teams:** Names + emoji. Team mode: assign players to 2+ teams, or auto-split evenly.
- **Timer:** Toggle on/off (default: off). When on, 60s auto-starts on card reveal for Words, Cliché, Associations, Gestures, Persona. **Dare is never timed** unless the group manually agrees.
- **Cards to win:** Adjustable target, default 10.
- **Single-Task Mode** (optional): Pick one challenge type; die is hidden and all cards use that type only.

### 5.3 Game Loop

1. **Rolling** — Current performer shown, phone passed. Tap "Roll & Draw":
   - Die rolls random 1–6 (truly random, no weighting)
   - Card drawn sequentially from shuffled deck (no repeats). When all cards exhausted, deck reshuffles automatically and continues.
   - In Single-Task Mode: die hidden, fixed challenge type always used.
   - **Free-tier:** On the 16th roll, show `PaywallGate` — *"Keep the party going for €2.99"* — instead of drawing.

2. **Reveal** — Full card PNG shown clean. Mode strip shows challenge + explanation.
   - If timer enabled and challenge is Words/Cliché/Associations/Gestures/Persona: 60s countdown starts automatically. Timer bar drains teal → pink.

3. **Scoring:**
   - **Solo:** First player to guess correctly taps "Correct" — they get the card (+1). Nobody guesses → "Skip" → card discarded. Turn passes clockwise.
   - **Team Play:** Performer's team guesses together. Host taps "Correct" (+1 to team) or "Skip" (discarded). Turn passes to next team; performer rotates clockwise within that team.

4. **Win check:** score ≥ cardsToWin → Winner screen. Deck runs out → Winner screen (most cards wins; tie → last scorer wins).

5. **Finished** — Confetti, final scores, "Play Again" (reshuffle, same setup) / "New Game" (back to setup).

### 5.4 Paywall Timing

On the 16th roll — after 15 complete cards of fun with all 6 challenge types. The `PaywallGate` message: *"Keep the party going — unlock all 75 cards for €2.99"*.

---

## 6. Page Routes

| Route | Page | Phase |
|-------|------|-------|
| `/` | Landing Page | 1 |
| `/play` | Free Game (player setup + game loop) | 1 |
| `/login` · `/signup` | Auth (email + Google OAuth) | 1 |
| `/auth/callback` | Supabase OAuth callback | 1 |
| `/pricing` | Pricing (Free / Plus / Pro) | 2 |
| `/dashboard` | User dashboard (plan, billing) | 2 |
| `/dashboard/cards` | Custom card editor (Pro) | 4 |
| `/dashboard/history` | Game history (Plus+) | 4 |
| `/room/new` | Create multiplayer room (Pro) | 3 |
| `/room/[code]` | Join room by code (no auth) | 3 |

---

## 7. Components

### Core Game Components
- **`<GameCard />`** — displays the PNG card with `next/image`, 5:7 aspect ratio, rounded corners, subtle noise overlay, card-in entrance animation
- **`<ModeStrip />`** — die badge + challenge name + explanation; colour-coded per die value; updates on roll; hidden in Single-Task Mode (fixed type shown instead)
- **`<Die />`** — 80px die with 3D CSS shadow, roll animation (600ms spring); hidden in Single-Task Mode
- **`<TimerBar />`** — 5px progress bar, 60s linear drain, teal→pink; only renders when `timerEnabled=true` and challenge ≠ Dare
- **`<ScoreBar />`** — solo: player chips (emoji, name, score); team mode: team chips with score; active entity highlighted teal
- **`<PlayerSetup />`** — mode selector (Solo/Teams), player name inputs + emoji picker, team assignment UI (Plus/Pro), timer toggle, cards-to-win selector, Single-Task Mode toggle

### UI Components
- **`<Button />`** — variants: primary (teal), pink, secondary (ghost), roll, correct, skip. All ≥48px height.
- **`<Badge />`** — challenge type badge, colour per type
- **`<Avatar />`** — emoji-based, 48px, teal border+glow when active
- **`<PaywallGate />`** — lock icon, feature name, perk list, price, Stripe CTA, dismiss link. Shown as modal overlay.
- **`<Toast />`** — correct/skip feedback, auto-dismiss 3.5s, aria-live polite
- **`<Modal />`** — generic modal wrapper with backdrop, escape-key dismiss

### Marketing Components
- **`<HeroSection />`** — bold headline, animated card preview, two CTAs
- **`<PricingCards />`** — three-column Free / Plus / Pro
- **`<ReviewCarousel />`** — existing 5-star reviews

---

## 8. Subscription Plans

```typescript
export const PLANS = {
  free:  { cards: 15, types: 'all', maxPlayers: 4,  rooms: false, customCards: 0 },
  plus:  { cards: 'all', types: 'all', maxPlayers: 12, rooms: false, customCards: 10, price_eur: 2.99 },
  pro:   { cards: 'all', types: 'all', maxPlayers: 'unlimited', rooms: true, customCards: 'unlimited', price_eur: 5.99 },
}
// Currency: Euro (€). All Stripe products created in EUR.
// Free tier: all 6 challenge types available, but deck capped at 15 cards.
// Paywall shown on the 16th roll — after they're hooked and having fun.

```

**Locked features by tier:**
- Free → Plus: card deck > 15; Team Play mode; players > 4; game history
- Plus → Pro: multiplayer rooms with guest link; unlimited custom cards; create & share card packs; remove Giglz branding

Note: all 6 challenge types, the optional 60s timer, and Single-Task Mode are available on the free tier. The only free limits are the 15-card deck cap and Solo-only play.

---

## 9. Supabase Schema

```sql
-- Extends auth.users
create table profiles (
  id               uuid primary key references auth.users(id),
  display_name     text,
  avatar_emoji     text default '😎',
  plan             text default 'free',  -- 'free' | 'plus' | 'pro'
  stripe_customer_id text,
  created_at       timestamptz default now()
);

create table subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references profiles(id),
  stripe_sub_id         text unique,
  plan                  text,
  status                text,  -- 'active' | 'canceled' | 'past_due'
  current_period_end    timestamptz,
  created_at            timestamptz default now()
);

create table rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,  -- 6-char e.g. "GIGLZ7"
  host_id     uuid references profiles(id),
  status      text default 'lobby', -- 'lobby' | 'playing' | 'finished'
  settings    jsonb default '{}',
  state       jsonb default '{}',
  created_at  timestamptz default now(),
  expires_at  timestamptz default now() + interval '4 hours'
);

create table room_players (
  room_id      uuid references rooms(id) on delete cascade,
  player_name  text not null,
  player_emoji text default '🎮',
  score        int default 0,
  joined_at    timestamptz default now(),
  primary key (room_id, player_name)
);

create table custom_cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id),
  content    text not null,
  type       text not null,
  is_public  boolean default false,
  created_at timestamptz default now()
);

create table game_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id),
  room_id          uuid references rooms(id),
  players          jsonb,
  winner           text,
  cards_played     int,
  duration_seconds int,
  played_at        timestamptz default now()
);
```

---

## 10. Animations

All animations use CSS keyframes. Durations follow the 150–600ms range (ui-ux-pro-max §7). All respect `prefers-reduced-motion`.

```css
/* Card entrance — 500ms spring */
@keyframes card-in {
  from { transform: translateY(20px) scale(0.9); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

/* Die roll — 600ms spring */
@keyframes die-roll {
  0%   { transform: rotate(0deg) scale(1); }
  20%  { transform: rotate(-20deg) scale(1.15); }
  50%  { transform: rotate(360deg) scale(0.9); }
  80%  { transform: rotate(700deg) scale(1.05); }
  100% { transform: rotate(720deg) scale(1); }
}

/* Score pop — 600ms spring, loops once */
@keyframes score-pop {
  0%, 100% { transform: scale(1); }
  40%       { transform: scale(1.5); color: var(--pink); }
}

/* Timer drain — 60s linear */
@keyframes timer-drain {
  from { width: 100%; }
  to   { width: 0%; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 11. Multiplayer Architecture (Phase 3)

- One Supabase Realtime channel per room, named by room code
- Game state stored in `rooms.state` (JSONB)
- Only the host writes state; guests subscribe and render
- Guest join: `/room/GIGLZ7` → enter name + emoji → lobby → game starts when host taps Start (no auth required for guests)
- Reconnect handler with visible "Reconnecting…" state (mobile networks can be flaky)

---

## 12. PWA Configuration

```json
{
  "name": "Giglz",
  "short_name": "Giglz",
  "start_url": "/play",
  "display": "standalone",
  "background_color": "#0d0820",
  "theme_color": "#7ADDDA",
  "orientation": "portrait"
}
```

---

## 13. Mobile-First Rules (ui-ux-pro-max §2, §5)

- Minimum touch target: **48px height** on all interactive elements
- Game card: minimum 320×448px (5:7 ratio)
- Die button: minimum 80×80px
- Font sizes: card content minimum 28px (readable across a table)
- Safe area insets: `padding-bottom: env(safe-area-inset-bottom)` on all bottom bars
- No hover-only states — everything works with touch
- Viewport: `width=device-width, initial-scale=1` — never disable zoom
- Tested at 375px (iPhone SE), 390px (iPhone 14), 768px (tablet)

---

## 14. Accessibility (ui-ux-pro-max §1)

- All text: WCAG AA minimum (4.5:1 contrast ratio)
- Focus rings: visible on all interactive elements
- `aria-live="polite"` on toast notifications
- `aria-label` on icon-only buttons
- `role="dialog"` + `aria-modal="true"` on PaywallGate
- Form labels on all inputs
- `prefers-reduced-motion` respected across all animations

---

## 15. 4-Phase Build Plan

### Phase 1 — Core Game + Auth + Landing (Week 1–2)
Next.js scaffold · CSS brand tokens · Unbounded + DM Sans fonts · fix card filename (rename `" 60 .png"` → `60.png`) · `<GameCard />` with card-in animation · `<Die />` with roll animation · `<ModeStrip />` · `<TimerBar />` · `<ScoreBar />` · game engine (`lib/game/engine.ts`) · card ID list (`lib/game/cards.ts`) · `/play` page (player setup + full game loop) · `<PaywallGate />` (UI-only gates) · landing page `/` · Supabase project + auth (email + Google OAuth) · `/login` + `/signup` pages · auth middleware · PWA manifest + next-pwa · deploy to Vercel

**Done = the free game works end-to-end and users can sign up.**

### Phase 2 — Subscriptions + Real Paywall (Week 3)
Stripe products (Plus €2.99 · Pro €5.99) · `/api/stripe/checkout` route · `/api/stripe/webhook` (update subscriptions table) · `/pricing` page · paywall gates enforced server-side · basic `/dashboard` (plan info + billing + logout) · Resend email setup · welcome email

**Done = someone can pay €2.99 and unlock the full game.**

### Phase 3 — Multiplayer Rooms (Week 4–5)
Supabase Realtime channel per room · `/api/room/create` · `/api/room/join` · `/room/new` (host screen: code + QR code + live player list) · `/room/[code]` (guest join: name + emoji → lobby) · host controls game progression · all guests see same card · reconnect handler + "Reconnecting…" state

**Done = a Pro user can host a room and friends join with a link.**

### Phase 4 — Polish + Growth (Week 6+)
Custom card editor (`/dashboard/cards`) · game history (`/dashboard/history`) · seasonal card packs · share results screen (screenshot-friendly) · SEO optimisation · analytics (Plausible or PostHog) · email drip to upsell Plus

---

## 16. Key Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Card display | Real PNG images | Cards already designed; no text DB needed |
| Active challenge indicator | Mode strip only (Option B) | Cleanest; card shown unmodified |
| Game mode | Single shared phone | Simpler for Phase 1; multiplayer in Phase 3 |
| Phase approach | Approach B (auth in P1, Stripe in P2) | Real user accounts from launch; no auth rework |
| Card count | 75 PNGs (26–100) | User-provided; 25 more planned |
| Win condition | First to 10 correct cards | Configurable via cardsToWin |
| Paywall timing | On the 16th roll (after 15 cards) | All 6 types available free; card count is the only limit |
