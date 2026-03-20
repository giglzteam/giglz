# Game UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the GiGLz logo in the header with a ranked top-3 leaderboard, and collapse the "Who guessed it?" player buttons into a single `✓ COMPLETE` button that opens a centre modal picker.

**Architecture:** Three focused changes — create `GuesserModal.tsx` (new component), update `Header.tsx` Row 1 (swap logo+chips for ranked pills), update `PlayGame.tsx` (add modal state, replace button section, wire modal). No changes to game engine, TimerBar, GameCard, or Dare flow.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, `cn()` via `tailwind-merge`

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Create | `components/game/GuesserModal.tsx` | New modal component with player rows + Nobody got it |
| Modify | `components/game/Header.tsx` | Row 1: remove logo + all-player chips, insert ranked top-3 pills |
| Modify | `components/game/PlayGame.tsx` | Add `showGuesserModal` state, replace die 1–5 button block, wire modal, fix timer |

---

## Task 1: Create `GuesserModal.tsx`

**Files:**
- Create: `components/game/GuesserModal.tsx`

No tests — project only tests pure game logic, not components.

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { GameState } from '@/lib/game/engine'

interface GuesserModalProps {
  state: GameState
  onScore: (index: number) => void
  onNobody: () => void
  onClose: () => void
}

export function GuesserModal({ state, onScore, onNobody, onClose }: GuesserModalProps) {
  const nonActivePlayers = state.mode === 'solo'
    ? state.players
        .map((p, i) => ({ name: p.name, emoji: p.emoji, score: p.score, index: i }))
        .filter(p => p.index !== state.currentPlayer)
    : state.teams
        .map((t, i) => ({ name: t.name, emoji: null, score: t.score, index: i }))
        .filter(t => t.index !== state.currentTeam)

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#13181f] border border-white/12 rounded-[18px] p-3 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[8px] uppercase tracking-[0.15em] font-bold text-white/30 text-center mb-2">
          Who guessed it?
        </p>

        <div className="flex flex-col gap-[3px]">
          {nonActivePlayers.map(p => (
            <button
              key={p.index}
              onClick={() => onScore(p.index)}
              className="flex items-center gap-2 h-[30px] px-3 rounded-[10px] bg-white/5 border border-white/[0.09] active:bg-teal/10 active:border-teal/30 w-full text-left"
            >
              {p.emoji && <span className="text-[13px]">{p.emoji}</span>}
              <span className="text-[9px] font-semibold text-white/80 flex-1">{p.name}</span>
              <span className="text-[8px] font-bold text-white/25">{p.score} pts</span>
            </button>
          ))}
        </div>

        <button
          onClick={onNobody}
          className="mt-1 w-full h-[26px] rounded-[9px] border border-white/7 text-white/30 text-[7px] font-semibold flex items-center justify-center gap-1"
        >
          → Nobody got it
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "GuesserModal\|error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/GuesserModal.tsx
git commit -m "feat: add GuesserModal component"
```

---

## Task 2: Update `Header.tsx` — Replace Row 1 with Ranked Pills

**Files:**
- Modify: `components/game/Header.tsx:21-97`

The goal: remove the `GiGLz` logo div (lines 22–24) and the existing all-player chip container (lines 25–87). Insert a single ranked chip container in their place. The unlock button (lines 88–96) and everything else stays.

- [ ] **Step 1: Replace the Row 1 content in `Header.tsx`**

Replace the entire Row 1 `<div>` (line 21 through the closing `</div>` at line 97) with:

```tsx
{/* Row 1 — ranked leaderboard */}
<div className="flex items-center justify-between px-4 pt-2 pb-1 gap-2">
  <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-none">
    {(state.mode === 'solo'
      ? [...state.players]
          .map((p, i) => ({ name: p.name, score: p.score, emoji: p.emoji as string, originalIndex: i }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((p, rank) => {
            const isLeader = rank === 0
            const isActiveTurn = !isLeader && p.originalIndex === state.currentPlayer
            return (
              <div
                key={p.name}
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 border flex-1 min-w-0 overflow-hidden ${
                  isLeader
                    ? 'border-yellow-400/35 bg-yellow-400/[0.06]'
                    : isActiveTurn
                    ? 'border-teal/35 bg-teal/[0.06]'
                    : 'border-white/8 bg-white/[0.04]'
                }`}
              >
                <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6px] font-black shrink-0 ${
                  isLeader ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/7 text-white/35'
                }`}>
                  {rank + 1}
                </div>
                <span className={`text-[7px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
                  isLeader ? 'text-white/85' : isActiveTurn ? 'text-teal' : 'text-white/50'
                }`}>
                  {p.name}
                </span>
                <span className={`text-[7px] font-black shrink-0 ${
                  isLeader ? 'text-yellow-400' : isActiveTurn ? 'text-teal' : 'text-white/25'
                }`}>
                  {p.score}
                </span>
              </div>
            )
          })
      : [...state.teams]
          .map((t, i) => ({ name: t.name, score: t.score, originalIndex: i }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((t, rank) => {
            const isLeader = rank === 0
            const isActiveTurn = !isLeader && t.originalIndex === state.currentTeam
            return (
              <div
                key={t.name}
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 border flex-1 min-w-0 overflow-hidden ${
                  isLeader
                    ? 'border-yellow-400/35 bg-yellow-400/[0.06]'
                    : isActiveTurn
                    ? 'border-teal/35 bg-teal/[0.06]'
                    : 'border-white/8 bg-white/[0.04]'
                }`}
              >
                <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6px] font-black shrink-0 ${
                  isLeader ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/7 text-white/35'
                }`}>
                  {rank + 1}
                </div>
                <span className={`text-[7px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
                  isLeader ? 'text-white/85' : isActiveTurn ? 'text-teal' : 'text-white/50'
                }`}>
                  {t.name}
                </span>
                <span className={`text-[7px] font-black shrink-0 ${
                  isLeader ? 'text-yellow-400' : isActiveTurn ? 'text-teal' : 'text-white/25'
                }`}>
                  {t.score}
                </span>
              </div>
            )
          })
    )}
  </div>
  {!isPlusPro && (
    <button
      onClick={onUnlock}
      aria-label="Unlock all"
      className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5 shrink-0"
    >
      🔓
    </button>
  )}
</div>
```

**Note on `isActiveTurn`:** `!isLeader && ...` ensures the leader chip always renders with gold styling even when they are also the active-turn player (gold takes precedence per spec).

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/Header.tsx
git commit -m "feat: replace logo with ranked top-3 leaderboard in header"
```

---

## Task 3: Update `PlayGame.tsx` — Wire Modal + Replace Button Section

**Files:**
- Modify: `components/game/PlayGame.tsx`

Four precise changes:

**A)** Add `GuesserModal` import.
**B)** Add `showGuesserModal` state.
**C)** Update `handleRollButton` and `handleTimerExpire` to close the modal.
**D)** Replace the die 1–5 button block with a single Complete button + wire the modal.

- [ ] **Step 1: Add the import (after line 6, alongside other component imports)**

Add to imports section:
```tsx
import { GuesserModal } from '@/components/game/GuesserModal'
```

- [ ] **Step 2: Add `showGuesserModal` state (after line 24, alongside other `useState` calls)**

```tsx
const [showGuesserModal, setShowGuesserModal] = useState(false)
```

- [ ] **Step 3: Update `handleRollButton` — add defensive modal close**

Change `handleRollButton` (lines 45–53) from:
```tsx
function handleRollButton() {
  if (rolling || !gameState) return
  if (cardCount >= cardLimit) { setShowPaywall(true); return }
  setRolling(true)
  setTimeout(() => {
    setRolling(false)
    handleRoll(rollDie())
  }, 650)
}
```

To:
```tsx
function handleRollButton() {
  if (rolling || !gameState) return
  if (cardCount >= cardLimit) { setShowPaywall(true); return }
  setShowGuesserModal(false)
  setRolling(true)
  setTimeout(() => {
    setRolling(false)
    handleRoll(rollDie())
  }, 650)
}
```

- [ ] **Step 4: Update `handleTimerExpire` — close modal on timer expiry**

Change `handleTimerExpire` (lines 73–75) from:
```tsx
const handleTimerExpire = useCallback(() => {
  setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
}, [])
```

To:
```tsx
const handleTimerExpire = useCallback(() => {
  setShowGuesserModal(false)
  setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
}, []) // eslint-disable-line react-hooks/exhaustive-deps
// setShowGuesserModal is a stable useState setter — safe to omit from deps
```

- [ ] **Step 5: Replace die 1–5 button block with single Complete button**

In the JSX, find the die 1–5 branch (lines 130–158):
```tsx
        ) : (
          /* Die 1–5: the guesser scores */
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
                      <Button key={p.i} variant="correct" className="flex-none text-sm px-4" onClick={() => handleCorrect(p.i)}>
                        {p.emoji} {p.name}
                      </Button>
                    ))
                : gameState.teams
                    .map((t, i) => ({ ...t, i }))
                    .filter(t => t.i !== gameState.currentTeam)
                    .map(t => (
                      <Button key={t.i} variant="correct" className="flex-none text-sm px-4" onClick={() => handleCorrect(t.i)}>
                        {t.name}
                      </Button>
                    ))
              }
            </div>
            <Button variant="skip" onClick={handleSkip}>Nobody got it →</Button>
          </div>
        )}
```

Replace with:
```tsx
        ) : (
          /* Die 1–5: tap Complete to open scorer picker */
          <Button variant="correct" className="w-full" onClick={() => setShowGuesserModal(true)}>
            ✓ COMPLETE
          </Button>
        )}
```

- [ ] **Step 6: Add the GuesserModal render (before the closing `</div>` of the root element, alongside `PaywallGate` and `Toast`)**

After line 161 (`{showPaywall && <PaywallGate .../>}`), add:
```tsx
      {showGuesserModal && gameState && (
        <GuesserModal
          state={gameState}
          onScore={(i) => { setShowGuesserModal(false); handleCorrect(i) }}
          onNobody={() => { setShowGuesserModal(false); handleSkip() }}
          onClose={() => setShowGuesserModal(false)}
        />
      )}
```

- [ ] **Step 7: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/game/PlayGame.tsx
git commit -m "feat: single Complete button + GuesserModal for scorer selection"
```

---

## Verification

After all tasks:

1. `npx tsc --noEmit` — no errors
2. `npm run build` — builds cleanly
3. Manual smoke test — solo mode, 3 players:
   - Rolling phase: header shows ranked pills (gold for #1), single `🎲 ROLL & DRAW` button
   - After roll: header unchanged, button switches to `✓ COMPLETE`
   - Tap Complete: modal opens with non-active players + "Nobody got it"
   - Tap a player: modal closes, score increments, toast appears
   - Tap "Nobody got it": modal closes, turn advances
   - Tap outside modal: modal closes without scoring
   - Timer expiry: modal closes automatically, turn advances
4. Teams mode: ranked pills show team names (no emoji), modal shows team names
5. Dare (die 6): `Skip →` + `Done ✓` buttons unchanged — modal never shown
