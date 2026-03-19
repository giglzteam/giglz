# Landing Page Design Spec
**Date:** 2026-03-19
**Project:** Giglz
**Scope:** Marketing landing page at `/` — Phase 1 completion

---

## Goal

Replace the `<main>Giglz</main>` placeholder with a full marketing landing page that converts visitors to the free game and seeds awareness of paid plans. Stripe is not yet integrated — paid CTAs are disabled.

---

## Architecture

`app/page.tsx` is a **Server Component** (no `'use client'`). It composes 7 components from `components/marketing/`.

`ReviewCarousel` is the only client boundary — it uses `useState` + `setInterval` and must have `'use client'` at the top of its file. All other marketing components are Server Components.

```
app/
  page.tsx                     ← Server Component, assembles all sections

components/marketing/          ← all Server Components except ReviewCarousel
  Navbar.tsx
  HeroSection.tsx
  HowItWorks.tsx
  ChallengeTypes.tsx
  ReviewCarousel.tsx            ← 'use client'
  PricingCards.tsx
  Footer.tsx
```

---

## Section Specs

### Navbar

- Sticky top, `z-50`, `var(--bg)` background, `1px solid var(--border)` bottom border
- Left: text "GIGLZ" — Unbounded font, `var(--teal)`, links to `/`
- Right (≥ 768px): "Sign In" ghost link → `/login` + "Play Free" primary button → `/play`
- Mobile (< 768px): hamburger icon (3 horizontal lines, 24px, `var(--text-primary)`) replaces right-side
  - On tap: full-width dropdown below nav, `z-50`, background `var(--surface1)`, padding `16px 24px`, with "Sign In" and "Play Free" stacked (full-width, 48px tap targets)
  - Dropdown closes when: a nav link is tapped, OR hamburger is tapped again (toggle)
  - No other nav links — exactly these two items

### HeroSection

- `min-h-screen`, flex column centered, `padding-top: 80px; padding-bottom: 40px; padding-inline: 24px` (asymmetric — does not follow the global `py-20` default)
- **Headline:** "Turn Any Party Unforgettable" — Unbounded, `font-size: clamp(2rem, 5vw, 4rem)`, `var(--text-primary)`, `text-align: center`
- **Subhead:** "No App Store. No Downloads. Click & Play. 200+ cards, 6 challenges." — DM Sans 500, `var(--text-secondary)`, centered, `max-width: 480px`
- **Static card mockup:**
  - `import { GameCard } from '@/components/game/GameCard'` (named export)
  - Render `<GameCard cardId={42} />`
  - `cardId` 42 is a valid value (range is 26–100)
  - The component unconditionally applies a `card-in` entrance animation — this is acceptable and intentional on the hero
  - No click handler. Wrap in `<div className="w-full max-w-xs mx-auto pointer-events-none">`
- **CTAs** (row, centered, `gap: 12px`):
  - "Play Free →" — primary button → `/play` (enabled)
  - "Get Plus" — secondary button style, `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`, native `title="Coming soon"`
- **Background glow:** `position: absolute`, `width: 400px; height: 400px; border-radius: 50%; background: var(--teal-glow); filter: blur(80px); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1`. Uses `--teal-glow: rgba(122,221,218,0.3)` from `globals.css`.
- Wrap entire section in `position: relative; overflow: hidden` to contain the glow.

### HowItWorks

- Section padding: `py-20` (Tailwind)
- Heading: "How It Works" — Unbounded, centered
- 4 steps, 4-column grid (≥ 768px) / vertical stack (< 768px)
- Exact step content:
  1. 🎲 **Roll the Die** — "Each die face maps to one of 6 challenge types"
  2. 🃏 **Draw a Challenge** — "Flip the card and read it out loud to your team"
  3. 🗣️ **Your Team Guesses** — "Timer on — shout out the answer before time runs out"
  4. 🏆 **First to 10 Wins** — "Collect cards, crown the champion, play again"
- Each step: circular teal badge (32px, `var(--teal)` bg, dark text, Unbounded) showing the step number; emoji (2rem); bold title (DM Sans 600); description (DM Sans 400, `var(--text-secondary)`)

### ChallengeTypes

- Section padding: `py-20`
- Heading: "6 Ways to Play" — Unbounded, centered
- 6 cards in a responsive grid: 2 columns (< 768px), 3 columns (≥ 768px)
- Each card: `var(--surface1)` background, `border-radius: 16px`, `padding: 20px`, `4px solid <color>` left border
- Die number badge: a small `<span>` — `width: 28px; height: 28px; border-radius: 8px; background: <color>; font-family: Unbounded; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center`. Text color varies by die (matches `DIE_TEXT_COLOR` in `Badge.tsx`): die 1 `#000`, die 2 `#000`, die 3 `#fff`, die 4 `#fff`, die 5 `#000`, die 6 `#000`. Not the existing `Badge` component (which shows a text label, not a number).
- Challenge name below badge: Unbounded font, `var(--text-primary)`
- Description below name: DM Sans 400, `var(--text-secondary)`, `font-size: 14px`
- **Note:** die-1 and die-6 share `#EA6CAE`; die-2 and die-5 share `#7ADDDA`. This is intentional from the existing design system — cards remain distinct via name, number, and description.
- Exact content (authoritative source: `DIE_MAP` in `@/lib/game/cards`):

  | Die | Name | Description | Color |
  |-----|------|-------------|-------|
  | 1 | Words | Explain without saying the word. No parts, no rhymes, no spelling! | `#EA6CAE` |
  | 2 | Cliché | Describe using only its most famous traits — without naming it! | `#7ADDDA` |
  | 3 | Associations | Give 3 quick associations to lead others to the answer. | `#68519E` |
  | 4 | Gestures | Act it out — no talking, no sounds! | `#3097D1` |
  | 5 | Persona | Read the initials aloud. Players guess the real person. | `#7ADDDA` |
  | 6 | Dare | Do what the card says. Group decides if completed. | `#EA6CAE` |

### ReviewCarousel

- File must begin with `'use client'`
- Section padding: `py-20`
- Heading: "What Players Say" — Unbounded, centered
- 3 review cards, one visible at a time
- **Rendering:** all 3 cards rendered in DOM; active card at `opacity: 1`, inactive at `opacity: 0`, using CSS `transition: opacity 0.3s ease`. Do not conditionally mount/unmount.
- **Dot indicators:** 3 dots below, active = `var(--teal)`, inactive = `var(--border)`. Tapping a dot jumps to that review index.
- **Auto-cycle:** `useEffect` sets up `setInterval` at 4000ms. The effect's **cleanup function must call `clearInterval`** to prevent memory leaks on unmount. Restart the interval when the user manually taps a dot.
- **Hover pause (desktop only):** Inside the `useEffect` (not at render scope — `window` is undefined during SSR), check `window.matchMedia('(pointer: fine)').matches`. If true, attach `mouseenter` → `clearInterval`, `mouseleave` → restart interval on the carousel wrapper ref. On mobile, auto-cycling runs indefinitely without pause.
- Placeholder reviews (exact content):
  1. ⭐⭐⭐⭐⭐ — "Best party game we've played in years. The challenges had everyone in tears." — **Jamie, Dublin**
  2. ⭐⭐⭐⭐⭐ — "Pulled this out at a flat party and we played for 3 hours straight." — **Sofia, Amsterdam**
  3. ⭐⭐⭐⭐⭐ — "Simple to pick up, impossible to put down. The dare cards are brutal." — **Tom, London**

### PricingCards

- Section padding: `py-20`
- Heading: "Simple Pricing" — Unbounded, centered
- Subhead: "Start free. Upgrade when you're hooked." — DM Sans, `var(--text-secondary)`, centered
- 3-column grid (≥ 768px) / stacked (< 768px)
- Features aligned with what is **actually implemented** in the app (not the original spec plan):

**Free — €0**
- Badge: "Start Here" (`var(--teal)` bg, dark text)
- Features (matches `PaywallGate.tsx` copy):
  - 15 cards
  - All 6 challenge types
  - Up to 4 players
  - Solo play
- CTA: "Play Free →" — primary button → `/play` (fully enabled, 48px min height)

**Plus — €2.99/mo**
- Badge: "Most Popular" (`var(--pink)` bg, white text)
- Features (matches `PaywallGate.tsx` copy):
  - All 75 cards
  - Team Play mode
  - Up to 12 players
  - Game history
- CTA: "Get Plus" — `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`, `title="Stripe coming soon"`

**Pro — €5.99/mo**
- No badge
- Features:
  - Everything in Plus
  - Multiplayer rooms with guest link
  - Unlimited custom cards
  - Create & share card packs
  - Stats dashboard
- CTA: "Get Pro" — same disabled treatment as Plus

### Footer

- Background: `var(--surface1)`, `1px solid var(--border)` top border
- Section padding: `py-10`
- Row 1 (flex, space-between):
  - Left: "GIGLZ" — Unbounded, `var(--teal)`, links to `/`
  - Right: nav links — "Play Free" → `/play`; "Sign In" → `/login`; "Pricing" — rendered as `<span>` (not `<a>`), `opacity: 0.4`, `cursor: not-allowed`, `title="Coming soon"` (consistent with how all unavailable features are treated in the app)
- Row 2 (flex, space-between):
  - Left: `© 2026 Giglz. Made for parties.` — DM Sans, `var(--text-secondary)`, `font-size: 14px`
  - Right: Instagram + TikTok SVG icons, 20×20px inline SVG (simple paths, no icon library), `href="#"` (intentionally inert), `aria-label="Follow on Instagram"` / `aria-label="Follow on TikTok"`, `fill: var(--text-secondary)`, CSS hover: `fill: var(--teal)` (Tailwind `hover:fill-[var(--teal)]` or inline style)

---

## Styling Constraints

- All import paths use `@/` alias — no relative paths
- All colors from existing CSS variables — no new values
- Fonts already loaded in root layout: Unbounded (`--font-display`) + DM Sans (`--font-body`)
- Mobile-first: 390px base, breakpoints at `768px` and `1280px`
- Minimum tap targets: `min-height: 48px` on all interactive elements
- No new npm dependencies — Tailwind utilities + inline styles only
- Section padding: `py-20` by default. **Exception:** HeroSection uses asymmetric padding (`pt-20 pb-10`) — this is intentional and takes precedence.

---

## Out of Scope

- Stripe checkout integration (Phase 2)
- Real review content (placeholder text ships now)
- `/pricing` page (Phase 2 — link intentionally shows "Coming soon" state)
- Hero card flip animation (static only, per user decision)
- Auth callback route (separate task)
- PWA manifest (separate task)
