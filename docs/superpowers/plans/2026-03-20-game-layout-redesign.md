# Game Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the player-name block, ModeStrip, and ScoreBar into a single compact two-row `Header` component to maximise card real estate on mobile.

**Architecture:** Create `Header.tsx` absorbing all three replaced components. Update `PlayGame.tsx` to render only `<Header>`, card container, `<TimerBar>`, and buttons. Delete `ScoreBar.tsx` and `ModeStrip.tsx`.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `components/game/Header.tsx` | Two-row header: identity bar (logo + score chips + unlock) and challenge bar (die badge + label + description + player name) |
| Modify | `components/game/PlayGame.tsx` | Swap in `<Header>`, remove player-name div + `<ModeStrip>` + `<ScoreBar>`, fix `currentPlayerName` derivation, remove `mt-1` from `<TimerBar>`, add `pt-2` to button container |
| Modify | `components/game/TimerBar.tsx` | Remove `mt-1` class from the wrapper div |
| Delete | `components/game/ScoreBar.tsx` | Functionality absorbed by `Header` |
| Delete | `components/game/ModeStrip.tsx` | Functionality absorbed by `Header` |

---

## Task 1: Create `Header.tsx`

**Files:**
- Create: `components/game/Header.tsx`

Reference: [spec](docs/superpowers/specs/2026-03-20-game-layout-redesign.md), `lib/game/cards.ts` (DIE_MAP, DieValue), `lib/game/engine.ts` (GameState type)

- [ ] **Step 1: Create the file with the correct props interface and imports**

```tsx
import { GameState } from '@/lib/game/engine'
import { DIE_MAP } from '@/lib/game/cards'

interface HeaderProps {
  state: GameState
  currentPlayerName: string
  isPlusPro: boolean
  onUnlock: () => void
}
```

- [ ] **Step 2: Implement Row 1 — identity bar**

Row 1 is `flex items-center justify-between px-4 pt-2 pb-1 gap-2`.

Left: GiGLz logo — `font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent`.

Centre: score chips — `flex-1 flex gap-1.5 justify-center overflow-x-auto scrollbar-none`.

Right: unlock button — render **only** when `!isPlusPro` (not CSS hidden). Use `text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5`.

Score chip logic:
- **Solo** (`state.mode === 'solo'`): one pill per player — `{p.emoji} · {p.name} · {p.score}`. Active when `i === state.currentPlayer`.
- **Teams** (`state.mode === 'teams'`): one pill per team — `{t.name} · {t.score}`. Active when `i === state.currentTeam`.

Active chip: `border border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)] rounded-full px-2 py-0.5`, score in `text-teal`.
Inactive chip: `border border-white/10 bg-white/6 rounded-full px-2 py-0.5`, muted text + dim score.
Name: `max-w-[48px] truncate text-[10px]`.

```tsx
export function Header({ state, currentPlayerName, isPlusPro, onUnlock }: HeaderProps) {
  return (
    <div className="shrink-0">
      {/* Row 1 */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 gap-2">
        <div className="font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">GiGLz</div>
        <div className="flex-1 flex gap-1.5 justify-center overflow-x-auto scrollbar-none">
          {state.mode === 'solo'
            ? state.players.map((p, i) => {
                const active = i === state.currentPlayer
                return (
                  <div key={p.name} className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] shrink-0 ${active ? 'border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)]' : 'border-white/10 bg-white/[0.06]'}`}>
                    <span>{p.emoji}</span>
                    <span className={`max-w-[48px] truncate ${active ? 'text-white' : 'text-[var(--text-muted)]'}`}>{p.name}</span>
                    <span className={`font-display font-black ${active ? 'text-teal' : 'text-white/40'}`}>{p.score}</span>
                  </div>
                )
              })
            : state.teams.map((t, i) => {
                const active = i === state.currentTeam
                return (
                  <div key={t.name} className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] shrink-0 ${active ? 'border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)]' : 'border-white/10 bg-white/[0.06]'}`}>
                    <span className={`max-w-[48px] truncate ${active ? 'text-white' : 'text-[var(--text-muted)]'}`}>{t.name}</span>
                    <span className={`font-display font-black ${active ? 'text-teal' : 'text-white/40'}`}>{t.score}</span>
                  </div>
                )
              })
          }
        </div>
        {!isPlusPro && (
          <button onClick={onUnlock} className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5 shrink-0">🔓</button>
        )}
      </div>
      {/* Row 2 — challenge bar (see Step 3) */}
    </div>
  )
}
```

- [ ] **Step 3: Implement Row 2 — challenge bar**

Row 2 wrapper: `mx-4 mb-2 px-3 py-2 rounded-xl bg-surface2 border border-[var(--border)] flex items-center gap-2`.

Determine active die value:
```ts
const active = state.singleTaskMode ? state.singleTaskDie : state.dieValue
```

**Rolling state** (`!active`): render die badge (greyed, `opacity-40`) + label `"Roll to find out"` in `text-[var(--text-muted)]`. No divider, no description, no player name.

**Reveal state** (`active` is truthy): look up `DIE_MAP[active]` and render all zones:
- Die badge: `w-6 h-6 rounded-md font-display font-black text-xs flex items-center justify-center shrink-0` with `style={{ background: challenge.color, boxShadow: \`0 0 8px ${challenge.color}55\` }}`
- Label: `text-[11px] font-black uppercase tracking-wide shrink-0` in `style={{ color: challenge.color }}`
- Divider: `w-px h-3 bg-white/15 mx-1 shrink-0`
- Description: `text-[11px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0`
- Player name: `text-[11px] font-bold text-teal ml-2 shrink-0` — `currentPlayerName` prop

Text colour of die badge number: `active === 2 || active === 5 ? '#000' : '#fff'` (matches ModeStrip logic).

Complete `Header` function incorporating both rows. Final file should export only `Header`.

- [ ] **Step 4: Verify the component compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep -E "Header|error" | head -20
```

Expected: no errors referencing `Header.tsx`.

- [ ] **Step 5: Commit**

```bash
git add components/game/Header.tsx
git commit -m "feat: add Header component (Row 1 + Row 2)"
```

---

## Task 2: Update `PlayGame.tsx`

**Files:**
- Modify: `components/game/PlayGame.tsx`

- [ ] **Step 1: Update imports — add Header, remove ModeStrip and ScoreBar**

Remove lines:
```tsx
import { ModeStrip } from '@/components/game/ModeStrip'
import { ScoreBar } from '@/components/game/ScoreBar'
```

Add line:
```tsx
import { Header } from '@/components/game/Header'
```

- [ ] **Step 2: Fix `currentPlayerName` derivation (lines 86–88)**

Replace:
```tsx
const isDare = gameState.dieValue === 6
const currentPlayerName = gameState.mode === 'solo'
  ? gameState.players[gameState.currentPlayer]?.name
  : gameState.teams[gameState.currentTeam]?.players[gameState.teams[gameState.currentTeam]?.currentPlayerIndex]
```

With:
```tsx
const isDare = gameState.dieValue === 6
const team = gameState.teams[gameState.currentTeam]
const currentPlayerName = gameState.mode === 'solo'
  ? gameState.players[gameState.currentPlayer]?.name ?? ''
  : team?.players[team?.currentPlayerIndex] ?? ''
```

- [ ] **Step 3: Replace the header section and remove player-name block**

In the JSX, remove the standalone player-name `<div>` (lines 97–102):
```tsx
<div className="text-center px-4 pb-0.5 shrink-0">
  <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
    {gameState.mode === 'teams' ? `${gameState.teams[gameState.currentTeam]?.name} — Performer` : 'Current Player'}
  </div>
  <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">{currentPlayerName}</div>
</div>
```

Replace the old inline header bar (lines 92–95) + the player-name div + `<ModeStrip>` line with:
```tsx
<Header
  state={gameState}
  currentPlayerName={currentPlayerName}
  isPlusPro={isPlusPro}
  onUnlock={() => setShowPaywall(true)}
/>
```

- [ ] **Step 4: Remove `<ScoreBar>` render**

Remove line:
```tsx
<ScoreBar state={gameState} />
```

- [ ] **Step 5: Add `pt-2` to the button container**

The button container currently is:
```tsx
<div className="px-4 pt-1 pb-3 shrink-0">
```

Change `pt-1` to `pt-2`:
```tsx
<div className="px-4 pt-2 pb-3 shrink-0">
```

- [ ] **Step 6: Verify compiles with no errors**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/game/PlayGame.tsx
git commit -m "feat: wire Header into PlayGame, remove ModeStrip/ScoreBar renders"
```

---

## Task 3: Remove `mt-1` from `TimerBar.tsx`

**Files:**
- Modify: `components/game/TimerBar.tsx`

- [ ] **Step 1: Remove `mt-1` from the wrapper div (line 18)**

Change:
```tsx
<div className="mx-4 mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
```

To:
```tsx
<div className="mx-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
```

The visual gap is now controlled by `pt-2` on the button container in `PlayGame`.

- [ ] **Step 2: Commit**

```bash
git add components/game/TimerBar.tsx
git commit -m "fix: remove mt-1 from TimerBar, gap now owned by button container"
```

---

## Task 4: Delete `ScoreBar.tsx` and `ModeStrip.tsx`

**Files:**
- Delete: `components/game/ScoreBar.tsx`
- Delete: `components/game/ModeStrip.tsx`

- [ ] **Step 1: Verify no remaining imports of these files**

```bash
cd /Users/max/Documents/GitHub/giglz && grep -r "ScoreBar\|ModeStrip" --include="*.tsx" --include="*.ts" -l | grep -v node_modules
```

Expected: no results (both imports were already removed from `PlayGame.tsx`).

- [ ] **Step 2: Delete the files**

```bash
rm /Users/max/Documents/GitHub/giglz/components/game/ScoreBar.tsx
rm /Users/max/Documents/GitHub/giglz/components/game/ModeStrip.tsx
```

- [ ] **Step 3: Final compile check**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete ScoreBar and ModeStrip — absorbed into Header"
```

---

## Verification

After all tasks:

1. Run `npx tsc --noEmit` — no errors
2. Run `npm run build` — builds cleanly
3. Manual smoke test on mobile viewport (iPhone SE: 375×667):
   - Header shows logo + score chips + unlock button in Row 1
   - Row 2 shows "Roll to find out" in rolling state
   - After roll, Row 2 shows die badge + label + divider + description + player name
   - Card occupies significantly more vertical space than before
   - Timer bar appears flush above buttons (no double gap)
   - `isPlusPro=true`: unlock button not rendered at all
   - Teams mode: chips show team name + score (no emoji)
