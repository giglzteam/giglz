# Landing Page Design Spec
**Date:** 2026-03-19
**Project:** Giglz
**Scope:** Marketing landing page at `/` — Phase 1 completion

---

## Goal

Replace the `<main>Giglz</main>` placeholder with a full marketing landing page that converts visitors to the free game and seeds awareness of paid plans. Stripe is not yet integrated — paid CTAs are disabled with a "Coming Soon" state.

---

## Architecture

`app/page.tsx` composes 6 section components from `components/marketing/`. Each component is a standalone file with no shared state — they communicate nothing to each other.

```
app/
  page.tsx                        ← assembles all sections

components/marketing/
  Navbar.tsx                      ← sticky nav
  HeroSection.tsx                 ← headline + card mockup + CTAs
  HowItWorks.tsx                  ← 4-step visual
  ChallengeTypes.tsx              ← 6 challenge type cards
  ReviewCarousel.tsx              ← 3 placeholder reviews
  PricingCards.tsx                ← Free / Plus / Pro tiers
  Footer.tsx                      ← social + legal
```

---

## Section Specs

### Navbar
- Sticky top, `z-50`, background `--bg` with subtle bottom border
- Left: Giglz logo (text "GIGLZ" in Unbounded font, teal color, links to `/`)
- Right: "Sign In" ghost link (→ `/login`) + "Play Free" primary button (→ `/play`)
- Mobile: hamburger collapses to stacked links (Sign In + Play Free)

### HeroSection
- Full viewport height (`min-h-screen`), centered content
- Headline: "Turn Any Party Unforgettable" — Unbounded, large (clamp 2.5rem–5rem)
- Subhead: "No App Store. No Downloads. Click & Play. 200+ cards, 6 challenges." — DM Sans, muted color
- Static card mockup: renders `<GameCard />` with a sample card (type: `words`, content: "Explain it without saying it", die: 1) — no animation, no interactivity
- CTAs (row): "Play Free →" primary button (→ `/play`) + "Get Plus" secondary button (disabled, muted, cursor-not-allowed, tooltip "Coming soon")
- Subtle background: radial gradient glow behind the card in teal

### HowItWorks
- Section heading: "How It Works" — Unbounded
- 4 numbered steps in a horizontal row (desktop) / vertical stack (mobile):
  1. 🎲 Roll the Die — a die face maps to a challenge type
  2. 🃏 Draw a Challenge — flip the card and read it out loud
  3. 🗣️ Your Team Guesses — 60 seconds on the clock
  4. 🏆 First to 10 Wins — collect cards, crown the champion
- Each step: number badge (teal), icon/emoji, bold title, short description

### ChallengeTypes
- Section heading: "6 Ways to Play"
- 6 cards in a responsive grid (2 cols mobile, 3 cols desktop)
- Each card shows: die number, color-coded left border/accent, challenge type name, one-line description
- Colors from CSS variables: `--die-1` through `--die-6` (pink, teal, purple, blue, teal, pink — as defined in globals.css)
- Challenge types:
  1. Words — "Explain the word without saying it" — `--die-1`
  2. Cliché — "Complete the well-known phrase" — `--die-2`
  3. Associations — "Say words that connect to the topic" — `--die-3`
  4. Gestures — "Mime it — no talking allowed" — `--die-4`
  5. Persona — "Act as the character" — `--die-5`
  6. Dares — "Physical dare — no excuses" — `--die-6`

### ReviewCarousel
- Section heading: "What Players Say"
- 3 placeholder review cards, displayed one at a time with dot navigation
- Auto-cycles every 4 seconds (pauses on hover)
- Each review: 5-star rating (⭐⭐⭐⭐⭐), quote text, reviewer name + location
- Placeholder content:
  1. "Best party game we've played in years. The challenges had everyone in tears." — Jamie, Dublin
  2. "Pulled this out at a flat party and we played for 3 hours straight." — Sofia, Amsterdam
  3. "Simple to pick up, impossible to put down. The dare cards are brutal." — Tom, London
- Uses `useState` + `useEffect` — must be `'use client'`

### PricingCards
- Section heading: "Simple Pricing"
- 3-column layout (stacks on mobile): Free / Plus / Pro
- **Free:** highlighted as "Start Here", full opacity, "Play Free →" CTA (→ `/play`)
- **Plus (€2.99/mo):** "Most Popular" badge, features list, "Get Plus" button disabled with `cursor-not-allowed` + tooltip "Stripe coming soon"
- **Pro (€5.99/mo):** features list, "Get Pro" button disabled same treatment
- Features per plan match the spec in `GIGLZ_CLAUDE_CODE_PLAN.md` section 8

### Footer
- Simple 2-row layout: logo + nav links row, copyright row
- Nav links: Play Free, Sign In, Pricing (placeholder)
- Social icons: placeholder links for Instagram, TikTok (SVG icons or emoji)
- Copyright: "© 2026 Giglz. Made for parties."

---

## Styling Constraints

- All colors from existing CSS variables in `globals.css` — no new colors
- Fonts already loaded: Unbounded (display) + DM Sans (body)
- Mobile-first: designed at 390px, enhanced at 768px and 1280px
- Minimum tap targets: 48px height on all interactive elements
- No new dependencies — pure CSS + Tailwind

---

## Out of Scope

- Stripe checkout integration (Phase 2)
- Real review content (placeholder text ships now)
- `/pricing` dedicated page (Phase 2)
- Auth flow beyond linking to `/login` and `/signup`
- Animation on the hero card (static only)
