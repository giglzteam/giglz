# Game Layout Redesign

**Date:** 2026-03-20
**Status:** Approved
**Scope:** `PlayGame.tsx`, `ModeStrip.tsx`, `ScoreBar.tsx`, new `Header.tsx`

---

## Goal

Maximise the card's screen real estate on mobile by collapsing scattered chrome (player name section + mode strip + score bar) into a single compact two-row header. Challenge description stays permanently visible — players need it as a rulebook shortcut.

---

## Approved Layout

```
┌─────────────────────────────────────────────────┐
│  GiGLz   [😎 Dhdh 2] [🎯 Sam 1] [🏆 Alex 0]  🔓│  Row 1 — ~32px
│  [6] DARE  │  Do what the card says. Group…  Dhdh│  Row 2 — ~34px
├─────────────────────────────────────────────────┤
│                                                  │
│               CARD  (flex-1)                     │  ~+80px vs old layout on SE
│                                                  │
├─────────────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━━━━━━━━━  timer (when active)  │  4px
│  [ 🎲 ROLL & DRAW ] / [Skip →]  [Done ✓]        │  ~60px
└─────────────────────────────────────────────────┘
```

---

## Component Changes

### `PlayGame.tsx` — layout host

Remove the standalone player-name `<div>` block entirely. The outer shell becomes:

```
h-dvh flex flex-col overflow-hidden pb-safe
  └─ <Header> (shrink-0)          — rows 1+2
  └─ card container (flex-1 min-h-0)
  └─ <TimerBar>
  └─ buttons (shrink-0)
```

`ScoreBar` and `ModeStrip` are no longer rendered as separate children.

**`currentPlayerName` derivation** — cache the team to avoid double array lookup:

```ts
const team = gameState.teams[gameState.currentTeam]
const currentPlayerName =
  gameState.mode === 'solo'
    ? gameState.players[gameState.currentPlayer]?.name ?? ''
    : team?.players[team?.currentPlayerIndex] ?? ''
```

**Card container** stays height-driven: `h-full` wrapper with `aspectRatio: '5/7'` and `maxWidth: 320`. In rolling state `currentCardId` is `null` — `GameCard` renders a placeholder `div` for null/falsy IDs (lines 20–24). Card IDs begin at 26 so 0 never occurs in practice; the layout never collapses.

**TimerBar margins**: with `ScoreBar` removed, `TimerBar` now renders directly above the button row. Remove `mt-1` from `TimerBar` and instead let the button container carry `pt-2` so the visual gap is controlled from one side only.

---

### New `Header` component (`components/game/Header.tsx`)

Replaces the old header bar, `ModeStrip`, and `ScoreBar`. Two rows, full-width, `shrink-0`.

**Props:**
```ts
interface HeaderProps {
  state: GameState
  currentPlayerName: string   // pre-resolved with ?? '' fallback in PlayGame
  isPlusPro: boolean
  onUnlock: () => void
}
```

---

**Row 1 — identity bar** (`flex items-center justify-between px-4 pt-2 pb-1 gap-2`)

| Zone | Content | Notes |
|------|---------|-------|
| Left | `GiGLz` logo | gradient teal→pink, `font-display font-black text-lg` |
| Centre | Score chips | `flex-1 flex gap-1.5 justify-center overflow-x-auto scrollbar-none` |
| Right | `🔓` button | conditionally rendered — **do not render** the element at all when `isPlusPro` (not CSS `hidden`/`invisible`) |

**Score chips** — compact pill per player (solo) or per team (teams):
- Solo: `emoji · name · score` — name `max-w-[48px] truncate`
- Teams: `name · score` (no emoji) — name `max-w-[48px] truncate` (same cap; team names truncate equally)
- Active player/team: `border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)]`, score in teal
- Inactive: `border-white/10 bg-white/6`, muted text, dim score
- Max tested: 6 players / 4 teams

---

**Row 2 — challenge bar** (`mx-4 mb-2 px-3 py-2 rounded-xl bg-surface2 border-[var(--border)] flex items-center gap-2`)

Single `flex` row. **Two branches — rolling vs reveal:**

**Rolling state** (`state.phase === 'rolling'`): render only die badge (greyed, `opacity-40`) + label `"Roll to find out"` in `text-[var(--text-muted)]`. Do **not** render the divider, description, or player name elements. The old "Tap the button below" hint is intentionally removed — the Roll button is self-evident.

**Reveal state** (`state.phase === 'reveal'`): render all zones:

| Zone | Content |
|------|---------|
| Die badge | `w-6 h-6 rounded-md font-display font-black text-xs` — challenge colour bg + glow |
| Label | Challenge type in challenge colour, `text-[11px] font-black uppercase tracking-wide shrink-0` |
| Divider | `w-px h-3 bg-white/15 mx-1 shrink-0` — **not rendered** in rolling state |
| Description | `text-[11px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0` |
| Player name | `text-[11px] font-bold text-teal ml-2 shrink-0` — `currentPlayerName` prop |

**`singleTaskMode` override:** when `state.singleTaskMode` is `true`, use `state.singleTaskDie` (not `state.dieValue`) to look up the challenge from `DIE_MAP`. Mirrors existing `ModeStrip` logic: `const active = state.singleTaskMode ? state.singleTaskDie : state.dieValue`.

**Player name (Row 2):**
- Solo: the active performer (`currentPlayerName`)
- Teams: the individual performer within the active team — same `currentPlayerName` value passed from `PlayGame`

---

### `ScoreBar.tsx` — deleted

Functionality absorbed into `Header`. File removed.

---

### `ModeStrip.tsx` — deleted

Functionality absorbed into `Header` row 2. File removed.

---

## Visual Details

- **Header total height**: ~66px (row 1 ~32px + row 2 ~34px)
- **Card gain on iPhone SE**: ~80px vs pre-fix layout
- **Description text**: `text-[11px]` — readable; does not truncate (all `DIE_MAP` descriptions are short)
- **Border token**: Row 2 uses `border-[var(--border)]` explicitly — not Tailwind's default `border` utility

---

## What Stays the Same

- `GameCard.tsx` — no changes
- `TimerBar.tsx` — logic unchanged; only `mt-1` removed (margin moved to button container)
- `WinnerScreen.tsx` — no changes; receives `GameState` directly, unaffected by layout restructure
- All button variants and game logic — untouched
- Game engine and state types — untouched
