# Game UI Redesign — Ranked Header + Guesser Modal

**Date:** 2026-03-20
**Status:** Approved
**Scope:** `PlayGame.tsx`, `Header.tsx`, new `GuesserModal.tsx`

---

## Goal

Two changes that together keep the card as the undisputed hero of the screen:

1. **Header Row 1** — remove the GiGLz logo; replace with a compact ranked top-3 leaderboard (position badge + name + score).
2. **Bottom action area** — always a single full-width button. Label swaps from `🎲 ROLL & DRAW` to `✓ COMPLETE` when a card is drawn. "Who guessed it?" picker moves into a centre modal triggered by Complete.

---

## Approved Layout

```
┌─────────────────────────────────────────────────┐
│  [1·Dhdh·2]  [2·Sam·1]  [3·Alex·0]          🔓 │  Row 1 — ranked pills
│  [1] WORDS  │  Explain without saying…    Sam  │  Row 2 — challenge bar
├─────────────────────────────────────────────────┤
│                                                  │
│               CARD  (flex-1)                     │
│                                                  │
├─────────────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━  timer (when active)            │
│  [ 🎲 ROLL & DRAW ]  ←→  [ ✓ COMPLETE ]         │  single button, full width
└─────────────────────────────────────────────────┘
```

---

## Change 1 — Header Row 1: Ranked Pills

### What changes

In `Header.tsx` Row 1, **two existing elements are removed and one is replaced**:

1. **Remove** the `GiGLz` logo `<div>` (leftmost element).
2. **Remove** the existing all-players chip container (`flex-1 flex gap-1.5 justify-center overflow-x-auto scrollbar-none` — the one that currently shows every player as a score chip).
3. **Insert** a new ranked chip container in their place (takes the `flex-1` space the two removed elements occupied).

The `🔓` unlock button remains on the right, unchanged.

### Ranked chip layout

Row 1 wrapper stays: `flex items-center justify-between px-4 pt-2 pb-1 gap-2`

New chip container (replaces logo + old chip container):
```
flex-1 flex gap-1.5 overflow-x-auto scrollbar-none
```

Each chip: `flex items-center gap-0.5 rounded-full px-2 py-0.5 border flex-1 min-w-0 overflow-hidden`

Chip zones (left to right):
| Zone | Content | Classes |
|------|---------|---------|
| Position badge | `1` / `2` / `3` | `w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6px] font-black shrink-0` |
| Name | player/team name | `text-[7px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap` |
| Score | numeric score | `text-[7px] font-black shrink-0` |

**Chip states:**

| State | Border | Background | Name colour | Score colour | Badge bg/colour |
|-------|--------|------------|-------------|--------------|-----------------|
| #1 (leader) | `border-yellow-400/35` | `bg-yellow-400/[0.06]` | `text-white/85` | `text-yellow-400` | `bg-yellow-400/20 text-yellow-400` |
| Active turn | `border-teal/35` | `bg-teal/[0.06]` | `text-teal` | `text-teal` | `bg-white/7 text-white/35` — intentionally no glow shadow (keeps row compact) |
| Default | `border-white/8` | `bg-white/[0.04]` | `text-white/50` | `text-white/25` | `bg-white/7 text-white/35` |

**Note:** if the leader is also the active-turn player, `#1` styling takes precedence over active-turn teal.

### Top-3 derivation

Sort all players (solo) or teams (teams mode) by `.score` descending. Take the first 3. If fewer than 3 exist, render however many there are — chips are `flex-1` so they fill the space evenly.

```ts
const ranked = [...state.players]        // solo
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)

// teams mode
const ranked = [...state.teams]
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
```

Active indicator:
- Solo: chip is active-turn when player index equals `state.currentPlayer`
- Teams: chip is active-turn when team index equals `state.currentTeam`

---

## Change 2 — Single Action Button

### Rolling state (`phase === 'rolling'`)

Identical to today:
```tsx
<Button variant="roll" ...>🎲 ROLL & DRAW</Button>
```

No second button. No skip.

### Reveal state (`phase === 'reveal'`), die 1–5

Replace the entire "Who guessed it?" block (label + player buttons + Nobody got it button) with:
```tsx
<Button variant="correct" onClick={() => setShowGuesserModal(true)}>
  ✓ COMPLETE
</Button>
```

Single full-width button. Tapping it opens `GuesserModal`.

### Reveal state, die 6 (Dare)

**Unchanged.** Still renders `Skip →` + `Done ✓` side by side. Dare has a known scorer (the performer), so no picker is needed.

---

## Change 3 — `GuesserModal` component

New file: `components/game/GuesserModal.tsx`

### Props

```ts
interface GuesserModalProps {
  state: GameState
  onScore: (index: number) => void   // calls existing handleCorrect(index)
  onNobody: () => void               // calls existing handleSkip()
  onClose: () => void                // closes modal without action
}
```

### Structure

```
dimmed overlay (rgba(0,0,0,0.75) + backdrop-blur-sm)
  └─ modal card (bg-surface2 / #13181f, border, rounded-[18px], shadow)
       ├─ title: "WHO GUESSED IT?" — 8px uppercase muted
       ├─ player rows (one per non-active player/team)
       └─ "Nobody got it" row (skip, no score awarded)
```

**Overlay:** `fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50`
**Modal card:** `bg-[#13181f] border border-white/12 rounded-[18px] p-3 w-full max-w-xs shadow-2xl`

### Player rows

One row per non-active player/team (same filter as current "Who guessed it?" logic):
- Solo: all players where `i !== state.currentPlayer`
- Teams: all teams where `i !== state.currentTeam`

Row: `flex items-center gap-2 h-[30px] px-3 rounded-[10px] bg-white/5 border border-white/9 active:bg-teal/10 active:border-teal/30 cursor-pointer`

| Zone | Solo | Teams |
|------|------|-------|
| Left | player emoji (`text-[13px]`) | — |
| Name | `p.name` (`text-[9px] font-semibold text-white/80 flex-1`) | `t.name` (same) |
| Score | `p.score` + ` pts` (`text-[8px] font-bold text-white/25`) | `t.score` + ` pts` |

Tapping a row calls `onScore(i)` and the modal closes.

### "Nobody got it" row

Below the player rows, separated by `mt-1`:

```tsx
<button onClick={onNobody} className="w-full h-[26px] rounded-[9px] border border-white/7 text-white/30 text-[7px] font-semibold flex items-center justify-center gap-1">
  → Nobody got it
</button>
```

Calls `onNobody()` which triggers `handleSkip()`.

### Dismissal

Tapping the overlay backdrop closes the modal (`onClose`) without scoring. No explicit Cancel button needed.

The modal card itself must call `e.stopPropagation()` on its `onClick` to prevent taps inside the card from bubbling to the overlay and closing the modal:

```tsx
<div
  className="bg-[#13181f] border border-white/12 rounded-[18px] p-3 w-full max-w-xs shadow-2xl"
  onClick={(e) => e.stopPropagation()}
>
  ...
</div>
```

---

## State changes in `PlayGame.tsx`

Add one piece of state:
```ts
const [showGuesserModal, setShowGuesserModal] = useState(false)
```

Wire up:
```tsx
// Reveal, die 1–5
<Button variant="correct" onClick={() => setShowGuesserModal(true)}>
  ✓ COMPLETE
</Button>

// Modal
{showGuesserModal && (
  <GuesserModal
    state={gameState}
    onScore={(i) => { setShowGuesserModal(false); handleCorrect(i) }}
    onNobody={() => { setShowGuesserModal(false); handleSkip() }}
    onClose={() => setShowGuesserModal(false)}
  />
)}
```

Close modal whenever the game advances to the next turn. Two paths must both close it:

1. **`handleRollButton`** — defensive reset at the top of the function (the modal should already be closed by the time the user can roll, but this guards against any state desync):
```ts
setShowGuesserModal(false)
```

2. **`handleTimerExpire`** — timer expiry auto-advances the turn while the modal may still be open (e.g. player forgot to tap). Add `setShowGuesserModal(false)` to the existing `useCallback`:
```ts
const handleTimerExpire = useCallback(() => {
  setShowGuesserModal(false)
  setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
}, [])
```

---

## `Button` variant

The `correct` variant currently has `flex-[2]` which assumes a flex-row context with a Skip sibling. For the new single-button layout, override with `w-full` via `className` prop — the variant itself is not changed (dare still uses the old two-button row).

---

## What stays the same

- `TimerBar` — no changes
- `GameCard` — no changes
- Dare (die 6) button row — no changes
- `WinnerScreen`, `PlayerSetup`, `PaywallGate` — no changes
- Game engine, state types — no changes
- Row 2 (challenge bar) — no changes
- `🔓` unlock button placement — no changes
