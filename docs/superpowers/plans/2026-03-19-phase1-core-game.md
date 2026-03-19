# Giglz Phase 1 — Core Game + Auth + Landing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully working Giglz party game at `/play` with Solo and Team modes, PNG card display, optional timer, Supabase auth, and a landing page — deployed to Vercel.

**Architecture:** Next.js 14 App Router, pure client-side game state (no DB for gameplay), PNG cards served from `/public/cards/`, Supabase Auth for user accounts. PaywallGate is UI-only in this phase (enforcement added in Phase 2).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase JS v2, next-pwa, Google Fonts (Unbounded + DM Sans), Vercel

---

## File Map

```
giglz/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, metadata, PWA meta tags
│   ├── page.tsx                      # Landing page
│   ├── (game)/
│   │   ├── play/page.tsx             # /play — player setup + full game loop
│   │   └── layout.tsx                # Game layout (no nav chrome)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── auth/
│       └── callback/page.tsx         # Supabase OAuth redirect handler (/auth/callback)
│   └── globals.css                   # CSS brand tokens + Tailwind base
├── components/
│   ├── game/
│   │   ├── PlayerSetup.tsx           # Mode, players/teams, timer, options
│   │   ├── GameCard.tsx              # PNG card display with entrance animation
│   │   ├── Die.tsx                   # Animated die (80px, 3D shadow, roll keyframe)
│   │   ├── ModeStrip.tsx             # Die badge + challenge name + description
│   │   ├── TimerBar.tsx              # 60s countdown bar (teal→pink)
│   │   ├── ScoreBar.tsx              # Player/team chips with active highlight
│   │   ├── WinnerScreen.tsx          # Confetti + final scores + replay options
│   │   └── PaywallGate.tsx           # UI-only lock overlay (Phase 2 enforces server-side)
│   ├── ui/
│   │   ├── Button.tsx                # Variants: primary, pink, secondary, roll, correct, skip
│   │   ├── Modal.tsx                 # Generic backdrop modal, Esc to dismiss
│   │   ├── Toast.tsx                 # Auto-dismiss 3.5s, aria-live polite
│   │   └── Badge.tsx                 # Challenge type badge, colour per type
│   └── marketing/
│       ├── HeroSection.tsx
│       ├── HowItWorks.tsx
│       ├── ChallengeTypes.tsx
│       ├── PricingPreview.tsx
│       └── Footer.tsx
├── lib/
│   ├── game/
│   │   ├── cards.ts                  # CARD_IDS array, DIE_MAP constant
│   │   └── engine.ts                 # Pure functions: createGame, rollDie, drawCard, score, nextTurn, checkWin
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client (singleton)
│       └── server.ts                 # Server Supabase client (for Server Components)
├── middleware.ts                     # Next.js middleware: redirect /dashboard to /login if unauthed
├── public/
│   ├── cards/                        # 75 PNG cards (26.png–100.png)
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # icon-192.png, icon-512.png
└── __tests__/
    └── game/
        ├── cards.test.ts
        └── engine.test.ts
```

---

## Task 1: Project Scaffold + Brand Tokens

**Files:**
- Create: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Bootstrap the Next.js app**

```bash
cd /Users/max/Documents/GitHub/giglz
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
```

Expected: project scaffold created, `npm run dev` starts on port 3000.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr next-pwa
npm install -D @types/node
```

- [ ] **Step 3: Write CSS brand tokens in `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
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
  --bg:           #0d0820;
  --surface-1:    #160f2e;
  --surface-2:    #1e1640;
  --surface-3:    #281d54;
  --border:       rgba(122,221,218,0.12);
  --border-hover: rgba(122,221,218,0.28);
  --text-primary:   #ffffff;
  --text-secondary: rgba(255,255,255,0.6);
  --text-muted:     rgba(255,255,255,0.3);
  --die-1: #EA6CAE;
  --die-2: #7ADDDA;
  --die-3: #68519E;
  --die-4: #3097D1;
  --die-5: #7ADDDA;
  --die-6: #EA6CAE;
  --font-display: 'Unbounded', sans-serif;
  --font-body:    'DM Sans', sans-serif;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Configure Tailwind to expose brand tokens**

In `tailwind.config.ts`, add to `theme.extend`:

```ts
colors: {
  purple: '#68519E',
  teal: '#7ADDDA',
  pink: '#EA6CAE',
  blue: '#3097D1',
  bg: '#0d0820',
  surface1: '#160f2e',
  surface2: '#1e1640',
  surface3: '#281d54',
},
fontFamily: {
  display: ['Unbounded', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
},
```

- [ ] **Step 5: Update `app/layout.tsx` with metadata**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Giglz — The Party Game',
  description: 'No App Store. No Downloads. Click & Play.',
  themeColor: '#7ADDDA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000 — should show default Next.js page with dark background.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with Giglz brand tokens and fonts"
```

---

## Task 2: Fix Card Assets + Card Data

**Files:**
- Create: `lib/game/cards.ts`
- Modify: `public/cards/` (rename space filename)

- [ ] **Step 1: Rename the malformed file**

```bash
mv "/Users/max/Documents/GitHub/giglz/public/cards/ 60 .png" \
   "/Users/max/Documents/GitHub/giglz/public/cards/60.png"
```

Verify: `ls public/cards/60.png` — should exist without spaces.

- [ ] **Step 2: Write `lib/game/cards.ts`**

```ts
// All available card IDs (PNG filenames without extension)
export const ALL_CARD_IDS: number[] = Array.from(
  { length: 75 },
  (_, i) => i + 26  // 26, 27, ..., 100
)

// Free tier: first 15 cards of the shuffled deck
export const FREE_CARD_LIMIT = 15

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export interface ChallengeType {
  type: string
  label: string
  desc: string
  color: string
  timed: boolean   // false only for Dares
}

export const DIE_MAP: Record<DieValue, ChallengeType> = {
  1: { type: 'words',        label: 'Words',        desc: 'Explain without saying the word. No parts, no rhymes, no spelling!', color: '#EA6CAE', timed: true  },
  2: { type: 'cliche',       label: 'Cliché',       desc: 'Describe using only its most famous traits — without naming it!',   color: '#7ADDDA', timed: true  },
  3: { type: 'associations', label: 'Associations', desc: 'Give 3 quick associations to lead others to the answer.',            color: '#68519E', timed: true  },
  4: { type: 'gestures',     label: 'Gestures',     desc: 'Act it out — no talking, no sounds!',                               color: '#3097D1', timed: true  },
  5: { type: 'persona',      label: 'Persona',      desc: 'Read the initials aloud. Players guess the real person.',           color: '#7ADDDA', timed: true  },
  6: { type: 'dares',        label: 'Dare',         desc: 'Do what the card says. Group decides if completed.',                color: '#EA6CAE', timed: false },
}

export function cardImagePath(id: number): string {
  return `/cards/${id}.png`
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/game/cards.ts public/cards/60.png
git commit -m "feat: add card data (DIE_MAP, card IDs) and fix card filename"
```

---

## Task 3: Game Engine (Pure Functions)

**Files:**
- Create: `lib/game/engine.ts`
- Create: `__tests__/game/engine.test.ts`

- [ ] **Step 1: Install test runner**

```bash
npm install -D jest @types/jest ts-jest
```

Add to `package.json` scripts: `"test": "jest"`

Create `jest.config.ts`:
```ts
import type { Config } from 'jest'
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
export default config
```

- [ ] **Step 2: Write failing tests for engine**

Create `__tests__/game/engine.test.ts`:

```ts
import {
  createGame, rollDie, drawCard, scoreCard, skipCard,
  nextTurn, checkWin, shuffleDeck
} from '@/lib/game/engine'
import { ALL_CARD_IDS } from '@/lib/game/cards'

describe('shuffleDeck', () => {
  it('returns all card IDs exactly once', () => {
    const shuffled = shuffleDeck(ALL_CARD_IDS)
    expect(shuffled).toHaveLength(ALL_CARD_IDS.length)
    expect(new Set(shuffled).size).toBe(ALL_CARD_IDS.length)
    expect(shuffled.sort((a, b) => a - b)).toEqual([...ALL_CARD_IDS].sort((a, b) => a - b))
  })

  it('does not mutate the input array', () => {
    const original = [...ALL_CARD_IDS]
    shuffleDeck(ALL_CARD_IDS)
    expect(ALL_CARD_IDS).toEqual(original)
  })
})

describe('createGame', () => {
  it('creates solo game with shuffled deck', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    expect(state.phase).toBe('rolling')
    expect(state.deck).toHaveLength(ALL_CARD_IDS.length)
    expect(state.deckIndex).toBe(0)
    expect(state.players[0].score).toBe(0)
  })
})

describe('rollDie', () => {
  it('returns value between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const val = rollDie()
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(6)
    }
  })
})

describe('drawCard', () => {
  it('advances deckIndex and sets currentCardId', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = drawCard({ ...state, dieValue: 1 })
    expect(next.currentCardId).toBe(state.deck[0])
    expect(next.phase).toBe('reveal')
  })

  it('reshuffles when deck is exhausted', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: [26, 27, 28],
      cardsToWin: 100,
      timerEnabled: false,
    })
    // exhaust deck
    let s = { ...state, deckIndex: 3 }
    const next = drawCard({ ...s, dieValue: 1 })
    expect(next.deckIndex).toBe(1)  // reshuffled, drew index 0
  })
})

describe('scoreCard', () => {
  it('increments current player score in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = scoreCard(state)
    expect(next.players[0].score).toBe(1)
  })
})

describe('checkWin', () => {
  it('returns winner when score reaches cardsToWin', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 3,
      timerEnabled: false,
    })
    const s = { ...state, players: [{ name: 'Alice', emoji: '😎', score: 3 }] }
    expect(checkWin(s)).toBe('Alice')
  })

  it('returns null when no winner', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    expect(checkWin(state)).toBeNull()
  })

  it('returns winning team name in teams mode', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 3,
      timerEnabled: false,
    })
    const s = { ...state, teams: [{ name: 'Red', players: ['Alice'], score: 3, currentPlayerIndex: 0 }, { name: 'Blue', players: ['Bob'], score: 0, currentPlayerIndex: 0 }] }
    expect(checkWin(s)).toBe('Red')
  })
})

describe('nextTurn', () => {
  it('rotates currentPlayer in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = nextTurn({ ...state, currentPlayer: 0 })
    expect(next.currentPlayer).toBe(1)
    expect(next.phase).toBe('rolling')
  })

  it('rotates currentTeam and advances currentPlayerIndex within team', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice', 'Carol'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    // After Red's first turn, currentTeam should move to Blue
    const next = nextTurn({ ...state, currentTeam: 0 })
    expect(next.currentTeam).toBe(1)
    expect(next.phase).toBe('rolling')
    // After Blue's turn, goes back to Red and Red advances its player
    const next2 = nextTurn({ ...next, currentTeam: 1 })
    expect(next2.currentTeam).toBe(0)
    // Red team had 2 players, currentPlayerIndex should have advanced
    expect(next2.teams[0].currentPlayerIndex).toBe(1)
  })
})
```

- [ ] **Step 3: Run tests — expect failures**

```bash
npm test
```

Expected: all tests fail with "cannot find module".

- [ ] **Step 4: Implement `lib/game/engine.ts`**

```ts
import { ALL_CARD_IDS, DieValue } from './cards'

export type GameMode = 'solo' | 'teams'

export interface Player {
  name: string
  emoji: string
  score: number
}

export interface Team {
  name: string
  players: string[]
  score: number
  currentPlayerIndex: number
}

export interface GameState {
  mode: GameMode
  players: Player[]
  teams: Team[]
  currentTeam: number
  currentPlayer: number
  deck: number[]
  deckIndex: number
  currentCardId: number | null
  dieValue: DieValue | null
  phase: 'rolling' | 'reveal' | 'scoring' | 'finished'
  timerEnabled: boolean
  timerSeconds: number
  cardsToWin: number
  singleTaskMode: boolean
  singleTaskDie: DieValue | null
  winner: string | null
}

export interface CreateGameOptions {
  mode: GameMode
  players: { name: string; emoji: string }[]
  teams: { name: string; players: string[] }[]
  cardIds: number[]
  cardsToWin: number
  timerEnabled: boolean
  singleTaskDie?: DieValue | null
}

/** Fisher-Yates shuffle — returns new array */
export function shuffleDeck(ids: number[]): number[] {
  const deck = [...ids]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function createGame(opts: CreateGameOptions): GameState {
  return {
    mode: opts.mode,
    players: opts.players.map(p => ({ ...p, score: 0 })),
    teams: opts.teams.map((t, i) => ({ ...t, score: 0, currentPlayerIndex: 0 })),
    currentTeam: 0,
    currentPlayer: 0,
    deck: shuffleDeck(opts.cardIds),
    deckIndex: 0,
    currentCardId: null,
    dieValue: null,
    phase: 'rolling',
    timerEnabled: opts.timerEnabled,
    timerSeconds: 60,
    cardsToWin: opts.cardsToWin,
    singleTaskMode: !!opts.singleTaskDie,
    singleTaskDie: opts.singleTaskDie ?? null,
    winner: null,
  }
}

export function rollDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue
}

export function drawCard(state: GameState): GameState {
  let { deck, deckIndex } = state
  // reshuffle if exhausted
  if (deckIndex >= deck.length) {
    deck = shuffleDeck(deck)
    deckIndex = 0
  }
  return {
    ...state,
    deck,
    deckIndex: deckIndex + 1,
    currentCardId: deck[deckIndex],
    phase: 'reveal',
    timerSeconds: 60,
  }
}

export function scoreCard(state: GameState): GameState {
  if (state.mode === 'solo') {
    const players = state.players.map((p, i) =>
      i === state.currentPlayer ? { ...p, score: p.score + 1 } : p
    )
    return { ...state, players, phase: 'scoring' }
  } else {
    const teams = state.teams.map((t, i) =>
      i === state.currentTeam ? { ...t, score: t.score + 1 } : t
    )
    return { ...state, teams, phase: 'scoring' }
  }
}

export function skipCard(state: GameState): GameState {
  return { ...state, phase: 'scoring' }
}

export function nextTurn(state: GameState): GameState {
  if (state.mode === 'solo') {
    const currentPlayer = (state.currentPlayer + 1) % state.players.length
    return { ...state, currentPlayer, dieValue: null, currentCardId: null, phase: 'rolling' }
  } else {
    const currentTeam = (state.currentTeam + 1) % state.teams.length
    const teams = state.teams.map((t, i) =>
      i === state.currentTeam
        ? { ...t, currentPlayerIndex: (t.currentPlayerIndex + 1) % t.players.length }
        : t
    )
    return { ...state, teams, currentTeam, dieValue: null, currentCardId: null, phase: 'rolling' }
  }
}

export function checkWin(state: GameState): string | null {
  if (state.mode === 'solo') {
    const winner = state.players.find(p => p.score >= state.cardsToWin)
    return winner?.name ?? null
  } else {
    const winner = state.teams.find(t => t.score >= state.cardsToWin)
    return winner?.name ?? null
  }
}
```

- [ ] **Step 5: Run tests — expect all pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/game/engine.ts __tests__/game/engine.test.ts jest.config.ts
git commit -m "feat: game engine with Fisher-Yates shuffle, solo/team scoring, win detection"
```

---

## Task 4: UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Create `components/ui/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'pink' | 'secondary' | 'roll' | 'correct' | 'skip'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:   'bg-teal text-black font-display font-black tracking-wide shadow-[0_0_28px_var(--teal-glow)] hover:shadow-[0_0_40px_var(--teal-glow)] active:scale-95',
  pink:      'bg-pink text-white font-display font-black tracking-wide shadow-[0_0_28px_var(--pink-glow)] active:scale-95',
  secondary: 'bg-transparent text-white border border-[var(--border-hover)] font-semibold hover:bg-white/5 active:scale-95',
  roll:      'w-full bg-gradient-to-br from-purple to-blue text-white font-display font-black tracking-widest shadow-[0_0_32px_var(--purple-glow)] active:scale-95 rounded-2xl',
  correct:   'flex-[2] bg-teal text-black font-display font-black tracking-wide shadow-[0_0_24px_var(--teal-glow)] active:scale-95 rounded-2xl',
  skip:      'flex-1 bg-surface2 text-[var(--text-secondary)] border border-[var(--border)] font-semibold active:scale-95 rounded-2xl',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Create `components/ui/Badge.tsx`**

```tsx
import { DIE_MAP, DieValue } from '@/lib/game/cards'

export function Badge({ die }: { die: DieValue }) {
  const challenge = DIE_MAP[die]
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold rounded-full px-3 py-1"
      style={{ background: challenge.color, color: die === 2 || die === 5 ? '#000' : '#fff' }}
    >
      {challenge.label}
    </span>
  )
}
```

- [ ] **Step 4: Create `components/ui/Toast.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface2 border border-teal/30 rounded-full px-5 py-3 shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <span className="w-6 h-6 rounded-full bg-teal text-black flex items-center justify-center text-xs font-black">✓</span>
      {message}
    </div>
  )
}
```

- [ ] **Step 5: Create `components/ui/Modal.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

interface ModalProps {
  onClose?: () => void
  children: React.ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/ui/ lib/utils.ts
git commit -m "feat: base UI components (Button, Badge, Toast, Modal)"
```

---

## Task 5: Game Components

**Files:**
- Create: `components/game/ModeStrip.tsx`
- Create: `components/game/Die.tsx`
- Create: `components/game/GameCard.tsx`
- Create: `components/game/TimerBar.tsx`
- Create: `components/game/ScoreBar.tsx`
- Create: `components/game/PaywallGate.tsx`
- Create: `components/game/WinnerScreen.tsx`

- [ ] **Step 1: Create `components/game/ModeStrip.tsx`**

```tsx
import { DieValue, DIE_MAP } from '@/lib/game/cards'

interface ModeStripProps {
  dieValue: DieValue | null
  singleTaskDie?: DieValue | null
}

export function ModeStrip({ dieValue, singleTaskDie }: ModeStripProps) {
  const active = singleTaskDie ?? dieValue

  if (!active) {
    return (
      <div className="mx-4 mb-3 bg-surface2 border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3 opacity-40">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">🎲</div>
        <div>
          <div className="font-display font-black text-xs tracking-wide text-white/50 uppercase">Roll to find out...</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Tap the button below</div>
        </div>
      </div>
    )
  }

  const challenge = DIE_MAP[active]
  return (
    <div className="mx-4 mb-3 bg-surface2 border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-2xl shrink-0"
        style={{ background: challenge.color, boxShadow: `0 0 20px ${challenge.color}55`, color: active === 2 || active === 5 ? '#000' : '#fff' }}
      >
        {active}
      </div>
      <div>
        <div className="font-display font-black text-xs tracking-wide uppercase mb-0.5" style={{ color: challenge.color }}>
          {challenge.label}
        </div>
        <div className="text-xs text-[var(--text-secondary)] leading-snug">{challenge.desc}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/game/Die.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { DieValue } from '@/lib/game/cards'

interface DieProps {
  value: DieValue | null
  onRoll: (value: DieValue) => void
  disabled?: boolean
}

export function Die({ value, onRoll, disabled }: DieProps) {
  const [rolling, setRolling] = useState(false)

  function handleRoll() {
    if (disabled || rolling) return
    setRolling(true)
    setTimeout(() => {
      const rolled = (Math.floor(Math.random() * 6) + 1) as DieValue
      setRolling(false)
      onRoll(rolled)
    }, 600)
  }

  return (
    <button
      onClick={handleRoll}
      disabled={disabled || rolling}
      aria-label={value ? `Die shows ${value}` : 'Roll die'}
      className={`
        w-20 h-20 rounded-[20px] flex items-center justify-center
        font-display font-black text-4xl text-white
        cursor-pointer select-none transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-90
        ${rolling ? 'animate-[die-roll_600ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
      `}
      style={{
        background: 'var(--purple)',
        boxShadow: '0 0 32px var(--purple-glow), 4px 4px 0 var(--purple-deep), 0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      {rolling ? '?' : (value ?? '🎲')}
    </button>
  )
}
```

Add `die-roll` keyframe to `app/globals.css`:
```css
@keyframes die-roll {
  0%   { transform: rotate(0deg) scale(1); }
  20%  { transform: rotate(-20deg) scale(1.15); }
  50%  { transform: rotate(360deg) scale(0.9); }
  80%  { transform: rotate(700deg) scale(1.05); }
  100% { transform: rotate(720deg) scale(1); }
}
@keyframes card-in {
  from { transform: translateY(20px) scale(0.9); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes score-pop {
  0%, 100% { transform: scale(1); }
  40%       { transform: scale(1.5); color: var(--pink); }
}
```

- [ ] **Step 3: Create `components/game/GameCard.tsx`**

```tsx
import Image from 'next/image'
import { cardImagePath } from '@/lib/game/cards'

interface GameCardProps {
  cardId: number | null
}

export function GameCard({ cardId }: GameCardProps) {
  if (!cardId) {
    return (
      <div className="w-full aspect-[5/7] rounded-3xl bg-surface2 border border-[var(--border)] flex items-center justify-center">
        <span className="font-display text-4xl opacity-10">?</span>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[5/7] relative rounded-3xl overflow-hidden animate-[card-in_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ boxShadow: '0 8px 40px var(--purple-glow), 0 0 0 2px rgba(122,221,218,0.15)' }}
    >
      <Image
        src={cardImagePath(cardId)}
        alt={`Giglz card ${cardId}`}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 640px) 90vw, 360px"
      />
    </div>
  )
}
```

- [ ] **Step 4: Create `components/game/TimerBar.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

interface TimerBarProps {
  enabled: boolean
  running: boolean
  onExpire: () => void
}

export function TimerBar({ enabled, running, onExpire }: TimerBarProps) {
  const [seconds, setSeconds] = useState(60)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled || !running) { setSeconds(60); return }
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(ref.current!); onExpire(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(ref.current!)
  }, [enabled, running, onExpire])

  if (!enabled) return null

  const pct = (seconds / 60) * 100
  const color = pct > 40 ? 'var(--teal)' : pct > 20 ? '#F97316' : 'var(--pink)'

  return (
    <div className="mx-4 mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-1000 linear"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
      />
    </div>
  )
}
```

- [ ] **Step 5: Create `components/game/ScoreBar.tsx`**

```tsx
import { GameState } from '@/lib/game/engine'

export function ScoreBar({ state }: { state: GameState }) {
  if (state.mode === 'solo') {
    return (
      <div className="flex justify-around items-center px-4 py-2 border-t border-[var(--border)] bg-surface1">
        {state.players.map((p, i) => (
          <div key={p.name} className="flex flex-col items-center gap-0.5">
            <span className={`text-lg ${i === state.currentPlayer ? 'drop-shadow-[0_0_8px_var(--teal)]' : ''}`}>{p.emoji}</span>
            <span className={`text-[9px] uppercase tracking-widest font-semibold ${i === state.currentPlayer ? 'text-teal' : 'text-[var(--text-muted)]'}`}>{p.name}</span>
            <span className={`font-display font-black text-sm ${i === state.currentPlayer ? 'text-teal' : 'text-white'}`}>{p.score}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-around items-center px-4 py-2 border-t border-[var(--border)] bg-surface1">
      {state.teams.map((t, i) => (
        <div key={t.name} className="flex flex-col items-center gap-0.5">
          <span className={`text-[9px] uppercase tracking-widest font-semibold ${i === state.currentTeam ? 'text-teal' : 'text-[var(--text-muted)]'}`}>{t.name}</span>
          <span className={`font-display font-black text-lg ${i === state.currentTeam ? 'text-teal' : 'text-white'}`}>{t.score}</span>
          <span className="text-[8px] text-[var(--text-muted)]">{t.players[t.currentPlayerIndex]}'s turn</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Create `components/game/PaywallGate.tsx`**

```tsx
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface PaywallGateProps {
  onDismiss: () => void
}

export function PaywallGate({ onDismiss }: PaywallGateProps) {
  return (
    <Modal onClose={onDismiss}>
      <div className="bg-surface1 border border-[var(--border)] rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-[at_50%_0%] from-teal/10 to-transparent pointer-events-none" />
        <div className="w-14 h-14 bg-surface2 border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 stroke-teal" fill="none" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="font-display font-black text-lg mb-2">Keep the Party Going!</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          You've played 15 free cards. Unlock all 75 cards and keep the laughs coming.
        </p>
        <ul className="text-left space-y-2 mb-6">
          {['All 75 cards', 'Team Play mode', 'Up to 12 players', 'Game history'].map(f => (
            <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="w-4.5 h-4.5 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-[9px] text-teal font-bold shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="font-display font-black text-2xl mb-1">€2.99 <span className="text-sm text-[var(--text-secondary)] font-sans font-normal">/ month</span></p>
        {/* Phase 2: link to /api/stripe/checkout — for now, link to /pricing */}
        <a href="/pricing" className="block w-full mt-4">
          <Button variant="primary" className="w-full rounded-2xl text-sm font-display">Unlock Plus Now</Button>
        </a>
        <button onClick={onDismiss} className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer">
          Continue free game →
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 7: Create `components/game/WinnerScreen.tsx`**

```tsx
import { GameState } from '@/lib/game/engine'
import { Button } from '@/components/ui/Button'

interface WinnerScreenProps {
  state: GameState
  winner: string
  onPlayAgain: () => void
  onNewGame: () => void
}

export function WinnerScreen({ state, winner, onPlayAgain, onNewGame }: WinnerScreenProps) {
  const scores = state.mode === 'solo'
    ? state.players.map(p => ({ name: p.name, score: p.score, emoji: p.emoji })).sort((a, b) => b.score - a.score)
    : state.teams.map(t => ({ name: t.name, score: t.score, emoji: '🏆' })).sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Winner!</div>
      <div className="text-5xl">{scores[0]?.emoji ?? '🏆'}</div>
      <div className="font-display font-black text-2xl text-teal">{winner}</div>
      <div className="text-sm text-[var(--text-secondary)]">with {scores[0]?.score} cards</div>
      <div className="w-full max-w-xs mt-4 space-y-2">
        {scores.map((s, i) => (
          <div key={s.name} className="flex justify-between items-center bg-surface2 rounded-xl px-4 py-2.5">
            <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {s.name}</span>
            <span className="font-display font-black text-sm" style={{ color: i === 0 ? 'var(--teal)' : 'white' }}>{s.score}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs mt-4 space-y-3">
        <Button variant="roll" onClick={onPlayAgain}>Play Again 🎲</Button>
        <button onClick={onNewGame} className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-2 cursor-pointer">New Game</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/game/ app/globals.css
git commit -m "feat: game components (ModeStrip, Die, GameCard, TimerBar, ScoreBar, PaywallGate, WinnerScreen)"
```

---

## Task 6: Player Setup Screen

**Files:**
- Create: `components/game/PlayerSetup.tsx`

- [ ] **Step 1: Create `components/game/PlayerSetup.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { GameMode } from '@/lib/game/engine'
import { DieValue, DIE_MAP } from '@/lib/game/cards'

const EMOJIS = ['😎','🔥','⚡','🎮','🎉','🤩','😈','🦁','🐯','🦊','👾','🤖']

interface SetupPlayer { name: string; emoji: string }

interface GameOptions {
  mode: GameMode
  players: SetupPlayer[]
  teams: { name: string; players: string[] }[]
  cardsToWin: number
  timerEnabled: boolean
  singleTaskDie: DieValue | null
}

interface PlayerSetupProps {
  isPlusPro: boolean
  onStart: (opts: GameOptions) => void
}

export function PlayerSetup({ isPlusPro, onStart }: PlayerSetupProps) {
  const [mode, setMode] = useState<GameMode>('solo')
  const [players, setPlayers] = useState<SetupPlayer[]>([
    { name: '', emoji: '😎' },
    { name: '', emoji: '🔥' },
  ])
  const [teamCount, setTeamCount] = useState(2)
  const [cardsToWin, setCardsToWin] = useState(10)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [singleTaskDie, setSingleTaskDie] = useState<DieValue | null>(null)
  const [emojiPickerFor, setEmojiPickerFor] = useState<number | null>(null)

  function addPlayer() {
    if (players.length >= (isPlusPro ? 12 : 4)) return
    setPlayers(p => [...p, { name: '', emoji: EMOJIS[p.length % EMOJIS.length] }])
  }

  function removePlayer(i: number) {
    if (players.length <= 2) return
    setPlayers(p => p.filter((_, idx) => idx !== i))
  }

  function buildTeams(): { name: string; players: string[] }[] {
    const named = players.filter(p => p.name.trim())
    const teams: { name: string; players: string[] }[] = Array.from({ length: teamCount }, (_, i) => ({ name: `Team ${i + 1}`, players: [] }))
    named.forEach((p, i) => teams[i % teamCount].players.push(p.name.trim()))
    return teams
  }

  function handleStart() {
    const validPlayers = players.filter(p => p.name.trim())
    if (validPlayers.length < 2) return
    onStart({
      mode,
      players: validPlayers,
      teams: mode === 'teams' ? buildTeams() : [],
      cardsToWin,
      timerEnabled,
      singleTaskDie,
    })
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col p-5 gap-5 pb-[env(safe-area-inset-bottom)]">
      <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">GiGLz</div>

      {/* Game mode */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Game Mode</div>
        <div className="flex gap-2">
          <button onClick={() => setMode('solo')} className={`flex-1 py-3 rounded-2xl text-sm font-display font-black transition-all ${mode === 'solo' ? 'bg-purple text-white shadow-[0_0_20px_var(--purple-glow)]' : 'bg-surface2 text-[var(--text-secondary)] border border-[var(--border)]'}`}>Solo</button>
          <button
            onClick={() => isPlusPro ? setMode('teams') : null}
            className={`flex-1 py-3 rounded-2xl text-sm font-display font-black transition-all relative ${mode === 'teams' ? 'bg-purple text-white shadow-[0_0_20px_var(--purple-glow)]' : 'bg-surface2 text-[var(--text-secondary)] border border-[var(--border)]'} ${!isPlusPro ? 'opacity-50' : ''}`}
          >
            Teams {!isPlusPro && <span className="text-[8px] absolute top-1 right-2 text-pink">Plus</span>}
          </button>
        </div>
      </div>

      {/* Players */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Players</div>
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setEmojiPickerFor(i === emojiPickerFor ? null : i)} className="w-12 h-12 rounded-xl bg-surface2 border border-[var(--border)] flex items-center justify-center text-2xl shrink-0 hover:border-[var(--border-hover)] transition-colors">
                {p.emoji}
              </button>
              <input
                type="text"
                value={p.name}
                onChange={e => setPlayers(ps => ps.map((pl, idx) => idx === i ? { ...pl, name: e.target.value } : pl))}
                placeholder={`Player ${i + 1}`}
                className="flex-1 bg-surface2 border border-[var(--border)] rounded-xl px-4 h-12 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-teal focus:shadow-[0_0_0_3px_var(--teal-glow)] transition-all"
              />
              {players.length > 2 && (
                <button onClick={() => removePlayer(i)} className="w-8 h-8 rounded-lg bg-surface2 text-[var(--text-muted)] flex items-center justify-center hover:text-pink transition-colors text-sm">✕</button>
              )}
            </div>
          ))}
          {emojiPickerFor !== null && (
            <div className="flex flex-wrap gap-2 p-3 bg-surface2 border border-[var(--border)] rounded-2xl">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { setPlayers(ps => ps.map((p, i) => i === emojiPickerFor ? { ...p, emoji: e } : p)); setEmojiPickerFor(null) }}
                  className="w-10 h-10 rounded-lg bg-surface3 flex items-center justify-center text-xl hover:scale-110 transition-transform">
                  {e}
                </button>
              ))}
            </div>
          )}
          {players.length < (isPlusPro ? 12 : 4) && (
            <button onClick={addPlayer} className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] text-sm hover:border-[var(--border-hover)] transition-colors">+ Add Player</button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Options</div>
        {/* Timer */}
        <div className="flex items-center justify-between bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div>
            <div className="text-sm font-semibold">60s Timer</div>
            <div className="text-xs text-[var(--text-muted)]">Optional — not applied to Dares</div>
          </div>
          <button onClick={() => setTimerEnabled(t => !t)} className={`w-12 h-6 rounded-full transition-all ${timerEnabled ? 'bg-teal' : 'bg-surface3'} relative`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${timerEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        {/* Cards to win */}
        <div className="flex items-center justify-between bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div className="text-sm font-semibold">Cards to Win</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCardsToWin(n => Math.max(3, n - 1))} className="w-8 h-8 rounded-lg bg-surface3 text-white font-bold">−</button>
            <span className="font-display font-black text-base w-6 text-center">{cardsToWin}</span>
            <button onClick={() => setCardsToWin(n => Math.min(30, n + 1))} className="w-8 h-8 rounded-lg bg-surface3 text-white font-bold">+</button>
          </div>
        </div>
        {/* Single-task mode */}
        <div className="bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div className="text-sm font-semibold mb-2">Single-Task Mode</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSingleTaskDie(null)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${singleTaskDie === null ? 'bg-purple text-white' : 'bg-surface3 text-[var(--text-muted)]'}`}>Off</button>
            {([1,2,3,4,5,6] as DieValue[]).map(d => (
              <button key={d} onClick={() => setSingleTaskDie(d)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${singleTaskDie === d ? 'text-black' : 'bg-surface3 text-[var(--text-muted)]'}`}
                style={singleTaskDie === d ? { background: DIE_MAP[d].color } : {}}>
                {DIE_MAP[d].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button variant="roll" onClick={handleStart} disabled={players.filter(p => p.name.trim()).length < 2} className="mt-auto">
        START GAME →
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/PlayerSetup.tsx
git commit -m "feat: player setup screen with mode, emoji picker, timer toggle, single-task mode"
```

---

## Task 7: `/play` Page (Full Game Loop)

**Files:**
- Create: `app/(game)/play/page.tsx`
- Create: `app/(game)/layout.tsx`

- [ ] **Step 1: Create game layout**

```tsx
// app/(game)/layout.tsx
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>
}
```

- [ ] **Step 2: Create `app/(game)/play/page.tsx`**

```tsx
'use client'
import { useState, useCallback } from 'react'
import { PlayerSetup } from '@/components/game/PlayerSetup'
import { GameCard } from '@/components/game/GameCard'
import { ModeStrip } from '@/components/game/ModeStrip'
import { Die } from '@/components/game/Die'
import { TimerBar } from '@/components/game/TimerBar'
import { ScoreBar } from '@/components/game/ScoreBar'
import { PaywallGate } from '@/components/game/PaywallGate'
import { WinnerScreen } from '@/components/game/WinnerScreen'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import {
  GameState, createGame, drawCard, scoreCard,
  skipCard, nextTurn, checkWin
} from '@/lib/game/engine'
import { ALL_CARD_IDS, FREE_CARD_LIMIT, DIE_MAP, DieValue } from '@/lib/game/cards'

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)

  // TODO Phase 2: read from session/subscription
  const isPlusPro = false
  const cardLimit = isPlusPro ? ALL_CARD_IDS.length : FREE_CARD_LIMIT

  function handleStart(opts: Parameters<typeof createGame>[0]) {
    const cardIds = isPlusPro ? ALL_CARD_IDS : ALL_CARD_IDS.slice(0, cardLimit)
    const state = createGame({ ...opts, cardIds })
    setGameState(state)
    setCardCount(0)
    setWinner(null)
  }

  function handleRoll(dieValue: DieValue) {
    if (!gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }

    const withDie: GameState = { ...gameState, dieValue: gameState.singleTaskMode ? gameState.singleTaskDie : dieValue }
    const next = drawCard(withDie)
    setGameState(next)
    setCardCount(c => c + 1)
  }

  function handleCorrect() {
    if (!gameState) return
    const scored = scoreCard(gameState)
    const w = checkWin(scored)
    if (w) { setGameState(scored); setWinner(w); return }
    const next = nextTurn(scored)
    setGameState(next)
    setToast('Correct! +1 point')
  }

  function handleSkip() {
    if (!gameState) return
    const skipped = skipCard(gameState)
    const next = nextTurn(skipped)
    setGameState(next)
  }

  const handleTimerExpire = useCallback(() => {
    handleSkip()
  }, [gameState])

  if (!gameState) return <PlayerSetup isPlusPro={isPlusPro} onStart={handleStart} />
  if (winner) return <WinnerScreen state={gameState} winner={winner} onPlayAgain={() => handleStart({ mode: gameState.mode, players: gameState.players, teams: gameState.teams, cardIds: ALL_CARD_IDS.slice(0, cardLimit), cardsToWin: gameState.cardsToWin, timerEnabled: gameState.timerEnabled })} onNewGame={() => setGameState(null)} />

  const isDare = gameState.dieValue === 6
  const currentPlayerName = gameState.mode === 'solo'
    ? gameState.players[gameState.currentPlayer]?.name
    : gameState.teams[gameState.currentTeam]?.players[gameState.teams[gameState.currentTeam]?.currentPlayerIndex]

  return (
    <div className="min-h-dvh bg-bg flex flex-col pb-[env(safe-area-inset-bottom)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">GiGLz</div>
        <button onClick={() => setShowPaywall(true)} className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5">🔓 Unlock All</button>
      </div>

      {/* Current player */}
      <div className="text-center px-4 pb-2">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
          {gameState.mode === 'teams' ? `${gameState.teams[gameState.currentTeam]?.name} — Performer` : 'Current Player'}
        </div>
        <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">{currentPlayerName}</div>
      </div>

      {/* Mode strip */}
      <ModeStrip dieValue={gameState.dieValue} singleTaskDie={gameState.singleTaskMode ? gameState.singleTaskDie : null} />

      {/* Card */}
      <div className="flex-1 px-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <GameCard cardId={gameState.currentCardId} />
        </div>
      </div>

      {/* Timer */}
      <TimerBar
        enabled={gameState.timerEnabled && gameState.phase === 'reveal' && !isDare}
        running={gameState.phase === 'reveal'}
        onExpire={handleTimerExpire}
      />

      {/* Score bar */}
      <ScoreBar state={gameState} />

      {/* Actions */}
      <div className="px-4 pt-2 pb-4">
        {gameState.phase === 'rolling' ? (
          <div className="flex flex-col items-center gap-4">
            {!gameState.singleTaskMode && <Die value={gameState.dieValue} onRoll={handleRoll} />}
            <Button variant="roll" onClick={() => handleRoll((Math.floor(Math.random() * 6) + 1) as DieValue)}>
              🎲 &nbsp;ROLL &amp; DRAW
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="skip" onClick={handleSkip}>Skip →</Button>
            <Button variant="correct" onClick={handleCorrect}>Correct ✓</Button>
          </div>
        )}
      </div>

      {showPaywall && <PaywallGate onDismiss={() => setShowPaywall(false)} />}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and manually test the game flow**

```bash
npm run dev
```

Verify:
- Player setup renders at http://localhost:3000/play
- Adding players and starting game works
- Roll & Draw shows card PNG and mode strip
- Correct / Skip advance turns
- Score increments correctly
- After 15 cards, paywall appears
- Winner screen appears when score reached

- [ ] **Step 4: Commit**

```bash
git add app/\(game\)/
git commit -m "feat: /play page with full solo/team game loop, paywall at card 15"
```

---

## Task 8: Supabase Auth Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`
- Create: `app/(auth)/callback/page.tsx`
- Create: `.env.local`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Copy URL and anon key.

- [ ] **Step 2: Create `.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Add `.env.local` to `.gitignore` (should already be there from Next.js scaffold).

- [ ] **Step 3: Create `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 5: Create `middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

- [ ] **Step 6: Create `app/(auth)/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleMagicLink() {
    setLoading(true)
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6 gap-6">
      <div className="font-display font-black text-2xl bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">GiGLz</div>
      {sent ? (
        <div className="text-center">
          <div className="text-2xl mb-3">✉️</div>
          <div className="font-display font-black text-lg mb-2">Check your email</div>
          <div className="text-sm text-[var(--text-secondary)]">We sent a magic link to {email}</div>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-surface2 border border-[var(--border)] rounded-xl px-4 h-12 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-teal focus:shadow-[0_0_0_3px_var(--teal-glow)] transition-all" />
          </div>
          <Button variant="primary" onClick={handleMagicLink} disabled={loading || !email} className="w-full rounded-2xl">
            {loading ? 'Sending…' : 'Send Magic Link'}
          </Button>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]"><div className="flex-1 h-px bg-[var(--border)]" />or<div className="flex-1 h-px bg-[var(--border)]" /></div>
          <Button variant="secondary" onClick={handleGoogle} className="w-full rounded-2xl">Continue with Google</Button>
          <p className="text-center text-xs text-[var(--text-muted)]">No account? <a href="/signup" className="text-teal hover:underline">Sign up free</a></p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Create `app/(auth)/signup/page.tsx`**

Same structure as login — Supabase magic link flow handles both signups and logins. Just change heading text to "Create your account" and swap login link to sign-in.

- [ ] **Step 8: Create `app/(auth)/callback/page.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/')
    })
  }, [router])
  return <div className="min-h-dvh bg-bg flex items-center justify-center"><div className="font-display text-sm text-[var(--text-muted)]">Signing in…</div></div>
}
```

- [ ] **Step 9: Enable Google OAuth in Supabase dashboard**

Supabase → Authentication → Providers → Google → enable, add Google OAuth credentials.

- [ ] **Step 10: Commit**

```bash
git add lib/supabase/ middleware.ts app/\(auth\)/ .env.local
git commit -m "feat: Supabase auth (magic link + Google OAuth) with middleware protection"
```

---

## Task 9: Landing Page

**Files:**
- Create: `app/page.tsx`
- Create: `components/marketing/HeroSection.tsx`
- Create: `components/marketing/HowItWorks.tsx`
- Create: `components/marketing/ChallengeTypes.tsx`
- Create: `components/marketing/PricingPreview.tsx`
- Create: `components/marketing/Footer.tsx`

- [ ] **Step 1: Create `app/page.tsx`**

```tsx
import { HeroSection } from '@/components/marketing/HeroSection'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ChallengeTypes } from '@/components/marketing/ChallengeTypes'
import { PricingPreview } from '@/components/marketing/PricingPreview'
import { Footer } from '@/components/marketing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-bg">
      <HeroSection />
      <HowItWorks />
      <ChallengeTypes />
      <PricingPreview />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Create `components/marketing/HeroSection.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-16 pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(104,81,158,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="font-display font-black text-5xl md:text-7xl leading-none mb-4 relative">
        <span className="bg-gradient-to-br from-teal via-white to-pink bg-clip-text text-transparent">Turn Any Party</span><br />
        <span className="text-white">Unforgettable.</span>
      </div>
      <p className="text-[var(--text-secondary)] text-lg max-w-md mb-8 leading-relaxed">
        No App Store. No Downloads. Click &amp; Play.<br />6 challenges. 75 cards. Infinite laughs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 relative">
        <Link href="/play"><Button variant="primary" className="text-base px-8">Play Free Now</Button></Link>
        <Link href="/pricing"><Button variant="secondary" className="text-base px-8">Unlock All — €2.99</Button></Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/marketing/HowItWorks.tsx`**

```tsx
const steps = [
  { num: '1', title: 'Choose Your Teams', desc: 'Solo or team play — you decide. No registration required.' },
  { num: '2', title: 'Roll the Die', desc: 'Roll to get your challenge type. 6 types, infinite possibilities.' },
  { num: '3', title: 'Draw a Card', desc: 'Pick from 75 unique cards. No two games are the same.' },
  { num: '4', title: 'Most Cards Wins', desc: 'Race to 10 cards. First team or player to get there wins.' },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <h2 className="font-display font-black text-2xl text-center mb-10">How It Works</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {steps.map(s => (
          <div key={s.num} className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple flex items-center justify-center font-display font-black text-xl" style={{ boxShadow: '0 0 20px var(--purple-glow)' }}>{s.num}</div>
            <div className="font-display font-black text-sm">{s.title}</div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/marketing/ChallengeTypes.tsx`**

```tsx
import { DIE_MAP } from '@/lib/game/cards'

export function ChallengeTypes() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <h2 className="font-display font-black text-2xl text-center mb-10">6 Challenge Types</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {([1,2,3,4,5,6] as const).map(die => {
          const c = DIE_MAP[die]
          return (
            <div key={die} className="bg-surface1 border border-[var(--border)] rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg mb-3" style={{ background: c.color, color: die === 2 || die === 5 ? '#000' : '#fff' }}>{die}</div>
              <div className="font-display font-black text-sm mb-1" style={{ color: c.color }}>{c.label}</div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.desc}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `components/marketing/PricingPreview.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const plans = [
  { name: 'Free', price: '€0', features: ['15 cards', 'All 6 challenge types', 'Solo play', 'Up to 4 players'], cta: 'Play Free', href: '/play', variant: 'secondary' as const },
  { name: 'Plus', price: '€2.99/mo', features: ['All 75 cards', 'Team Play mode', 'Up to 12 players', 'Game history'], cta: 'Get Plus', href: '/pricing', variant: 'primary' as const, highlight: true },
  { name: 'Pro', price: '€5.99/mo', features: ['Everything in Plus', 'Multiplayer rooms', 'Unlimited custom cards', 'Share card packs'], cta: 'Get Pro', href: '/pricing', variant: 'pink' as const },
]

export function PricingPreview() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <h2 className="font-display font-black text-2xl text-center mb-10">Simple Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.name} className={`bg-surface1 border rounded-3xl p-6 flex flex-col gap-4 ${p.highlight ? 'border-teal shadow-[0_0_40px_var(--teal-glow)]' : 'border-[var(--border)]'}`}>
            {p.highlight && <div className="text-[9px] uppercase tracking-widest text-teal font-bold">Most Popular</div>}
            <div className="font-display font-black text-lg">{p.name}</div>
            <div className="font-display font-black text-2xl">{p.price}</div>
            <ul className="space-y-2 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-teal text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href={p.href}><Button variant={p.variant} className="w-full rounded-2xl">{p.cta}</Button></Link>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create `components/marketing/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
      <div className="font-display font-black text-base bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent mb-3">GiGLz</div>
      <div className="flex justify-center gap-6 mb-4">
        <a href="/pricing" className="hover:text-teal transition-colors">Pricing</a>
        <a href="/login" className="hover:text-teal transition-colors">Login</a>
        <a href="#" className="hover:text-teal transition-colors">Privacy</a>
        <a href="#" className="hover:text-teal transition-colors">Terms</a>
      </div>
      <div>© {new Date().getFullYear()} Giglz. Have Fun Playing!</div>
    </footer>
  )
}
```

- [ ] **Step 7: Check landing page**

```bash
npm run dev
```

Visit http://localhost:3000 — verify all sections render.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx components/marketing/
git commit -m "feat: landing page with hero, how it works, challenge types, pricing preview, footer"
```

---

## Task 10: PWA Configuration

**Files:**
- Create: `public/manifest.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "Giglz",
  "short_name": "Giglz",
  "description": "The party game. No downloads. Click & Play.",
  "start_url": "/play",
  "display": "standalone",
  "background_color": "#0d0820",
  "theme_color": "#7ADDDA",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Add placeholder PWA icons**

```bash
mkdir -p public/icons
# Create 192x192 and 512x512 placeholder PNGs using any image tool
# or use a PWA icon generator at https://favicon.io/
```

- [ ] **Step 3: Configure next-pwa in `next.config.ts`**

```ts
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})({
  images: {
    domains: [],
  },
})

export default nextConfig
```

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json public/icons/ next.config.ts
git commit -m "feat: PWA manifest and next-pwa config"
```

---

## Task 11: Deploy to Vercel

- [ ] **Step 1: Create Vercel project**

```bash
npx vercel
```

Follow prompts — link to giglz.org domain.

- [ ] **Step 2: Add environment variables in Vercel dashboard**

Vercel → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 3: Add `giglz.org` to Supabase allowed URLs**

Supabase → Authentication → URL Configuration:
- Site URL: `https://giglz.org`
- Redirect URLs: `https://giglz.org/auth/callback`

- [ ] **Step 4: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 5: Smoke test on real device**

Open https://giglz.org on a phone:
- Landing page loads
- `/play` — set up players, play 3 rounds
- Auth — sign up with email magic link
- Timer toggle works
- After 15 cards, paywall shows

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete — core game, auth, landing, PWA deployed to Vercel"
```

---

## Phase 1 Done Criteria

- [ ] `/play` works end-to-end: setup → roll → reveal → score → winner
- [ ] Solo mode: turns pass clockwise, first guesser gets point
- [ ] Team mode: accessible in setup (gated UI for free users), teams rotate correctly
- [ ] All 6 challenge types available in free tier
- [ ] Cards shuffle with no repeats; reshuffle when deck exhausted
- [ ] 60s timer optional, activates on reveal for all types except Dare
- [ ] Single-Task Mode: die hidden, fixed challenge type used
- [ ] PaywallGate appears on roll 16
- [ ] `/login` and `/signup` work (magic link + Google)
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] Landing page renders all sections
- [ ] PWA manifest installed; "Add to Home Screen" works on iOS/Android
- [ ] All tests pass: `npm test`
- [ ] Deployed to Vercel at giglz.org
