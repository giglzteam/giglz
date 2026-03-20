# Responsive Game Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the game screen scale gracefully across all devices by removing the hard-coded 320px card cap and adding `md:` breakpoint variants to text sizes, spacing, and element dimensions throughout the game UI.

**Architecture:** Four isolated Tailwind-only edits — no logic changes, no new components, no new files. Each task touches one file and adds `md:` responsive variants to existing class strings. The card grows to fill available height naturally; text and spacing scale at 768px+.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS (JIT), `cn()` via tailwind-merge

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `components/game/PlayGame.tsx` | Card wrapper: remove `maxWidth: 320`, scale area + bottom padding |
| Modify | `components/game/Header.tsx` | Row 1 + Row 2: responsive padding, badge size, text sizes (solo + teams branches) |
| Modify | `components/ui/Button.tsx` | Base class: `md:min-h-[56px] md:px-8 md:text-base` |
| Modify | `components/game/GuesserModal.tsx` | Modal width, heading, row height, text sizes, nobody button |

---

## Task 1: Update `PlayGame.tsx` — Card + Padding

**Files:**
- Modify: `components/game/PlayGame.tsx`

No tests — project only tests pure game logic, not components.

- [ ] **Step 1: Fix the card wrapper — remove `maxWidth: 320` cap**

Find this line (currently around line 107):
```tsx
        <div className="h-full" style={{ aspectRatio: '5 / 7', maxWidth: 320 }}>
```

Replace with:
```tsx
        <div className="h-full max-w-full" style={{ aspectRatio: '5 / 7' }}>
```

- [ ] **Step 2: Scale the card area wrapper padding**

Find (line ~105):
```tsx
      <div className="flex-1 min-h-0 px-4 py-1 flex items-center justify-center overflow-hidden">
```

Replace with:
```tsx
      <div className="flex-1 min-h-0 px-4 md:px-6 py-1 md:py-3 flex items-center justify-center overflow-hidden">
```

- [ ] **Step 3: Scale the bottom action section padding**

Find (line ~114):
```tsx
      <div className="px-4 pt-2 pb-3 shrink-0">
```

Replace with:
```tsx
      <div className="px-4 md:px-8 pt-2 pb-3 md:pb-6 shrink-0">
```

- [ ] **Step 4: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/game/PlayGame.tsx
git commit -m "feat: responsive card sizing — remove 320px cap, scale padding at md"
```

---

## Task 2: Update `Header.tsx` — Responsive Row 1 + Row 2

**Files:**
- Modify: `components/game/Header.tsx`

Note: Row 1 has two identical JSX branches (solo players and teams). **Both must be updated.** The changes are identical in each branch.

- [ ] **Step 1: Scale Row 1 outer wrapper padding**

Find (line ~21):
```tsx
      <div className="flex items-center justify-between px-4 pt-2 pb-1 gap-2">
```

Replace with:
```tsx
      <div className="flex items-center justify-between px-4 md:px-8 pt-2 md:pt-3 pb-1 md:pb-2 gap-2">
```

- [ ] **Step 2: Scale badge size + text in the solo branch**

Find the badge div in the solo map (line ~43):
```tsx
                      <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6px] font-black shrink-0 ${
```

Replace with:
```tsx
                      <div className={`w-[13px] h-[13px] md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-black shrink-0 ${
```

Find the name span in the solo map (line ~48):
```tsx
                      <span className={`text-[7px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
```

Replace with:
```tsx
                      <span className={`text-[7px] md:text-[9px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
```

Find the score span in the solo map (line ~53):
```tsx
                      <span className={`text-[7px] font-black shrink-0 ${
```

Replace with:
```tsx
                      <span className={`text-[7px] md:text-[9px] font-black shrink-0 ${
```

- [ ] **Step 3: Scale badge size + text in the teams branch (identical changes)**

Find the badge div in the teams map (line ~80):
```tsx
                      <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6px] font-black shrink-0 ${
```

Replace with:
```tsx
                      <div className={`w-[13px] h-[13px] md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-black shrink-0 ${
```

Find the name span in the teams map (line ~85):
```tsx
                      <span className={`text-[7px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
```

Replace with:
```tsx
                      <span className={`text-[7px] md:text-[9px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
```

Find the score span in the teams map (line ~90):
```tsx
                      <span className={`text-[7px] font-black shrink-0 ${
```

Replace with:
```tsx
                      <span className={`text-[7px] md:text-[9px] font-black shrink-0 ${
```

- [ ] **Step 4: Scale Row 2 challenge bar wrapper**

Find (line ~112):
```tsx
      <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-surface2 border border-[var(--border)] flex items-center gap-2">
```

Replace with:
```tsx
      <div className="mx-4 md:mx-8 mb-2 md:mb-3 px-3 md:px-4 py-2 md:py-3 rounded-xl bg-surface2 border border-[var(--border)] flex items-center gap-2">
```

- [ ] **Step 5: Scale the rolling die badge (? state)**

Find (line ~116):
```tsx
              className="w-6 h-6 rounded-md font-display font-black text-xs flex items-center justify-center shrink-0 opacity-40 bg-white/20"
```

Replace with:
```tsx
              className="w-6 h-6 md:w-8 md:h-8 rounded-md font-display font-black text-xs md:text-sm flex items-center justify-center shrink-0 opacity-40 bg-white/20"
```

- [ ] **Step 6: Scale the challenge die badge (revealed state)**

Find (line ~125):
```tsx
              className="w-6 h-6 rounded-md font-display font-black text-xs flex items-center justify-center shrink-0"
```

Replace with:
```tsx
              className="w-6 h-6 md:w-8 md:h-8 rounded-md font-display font-black text-xs md:text-sm flex items-center justify-center shrink-0"
```

- [ ] **Step 7: Scale all 4 `text-[11px]` instances in Row 2**

There are exactly 4 `text-[11px]` spans in Row 2. Replace each:

Instance 1 — "Roll to find out" (line ~120):
```tsx
            <span className="text-[11px] text-[var(--text-muted)]">Roll to find out</span>
```
→
```tsx
            <span className="text-[11px] md:text-[13px] text-[var(--text-muted)]">Roll to find out</span>
```

Instance 2 — challenge label (line ~135):
```tsx
              className="text-[11px] font-black uppercase tracking-wide shrink-0"
```
→
```tsx
              className="text-[11px] md:text-[13px] font-black uppercase tracking-wide shrink-0"
```

Instance 3 — challenge description (line ~141):
```tsx
              className="text-[11px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0"
```
→
```tsx
              className="text-[11px] md:text-[13px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0"
```

Instance 4 — current player name (line ~144):
```tsx
              className="text-[11px] font-bold text-teal ml-2 shrink-0"
```
→
```tsx
              className="text-[11px] md:text-[13px] font-bold text-teal ml-2 shrink-0"
```

- [ ] **Step 8: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/game/Header.tsx
git commit -m "feat: responsive header — scale pills, badges, and challenge bar at md"
```

---

## Task 3: Update `Button.tsx` — Responsive Base Size

**Files:**
- Modify: `components/ui/Button.tsx`

This is a single-line change to the base class string. It affects every button in the game — all variants inherit the base.

- [ ] **Step 1: Scale the base button height, padding, and text**

Find the base class string (line ~19):
```tsx
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
```

Replace with:
```tsx
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 min-h-[48px] md:min-h-[56px] px-6 md:px-8 md:text-base rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat: responsive button — scale height, padding, and text at md"
```

---

## Task 4: Update `GuesserModal.tsx` — Responsive Modal

**Files:**
- Modify: `components/game/GuesserModal.tsx`

- [ ] **Step 1: Widen the modal card on tablet**

Find (line ~26 — the modal card div):
```tsx
        className="bg-[#13181f] border border-white/12 rounded-[18px] p-3 w-full max-w-xs shadow-2xl"
```

Replace with:
```tsx
        className="bg-[#13181f] border border-white/12 rounded-[18px] p-3 md:p-5 w-full max-w-xs md:max-w-sm shadow-2xl"
```

- [ ] **Step 2: Scale the "Who guessed it?" heading**

Find (line ~29):
```tsx
        <p className="text-[8px] uppercase tracking-[0.15em] font-bold text-white/30 text-center mb-2">
```

Replace with:
```tsx
        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.15em] font-bold text-white/30 text-center mb-2">
```

- [ ] **Step 3: Scale player row height**

Find (line ~38 — the player button):
```tsx
              className="flex items-center gap-2 h-[30px] px-3 rounded-[10px] bg-white/5 border border-white/[0.09] active:bg-teal/10 active:border-teal/30 w-full text-left"
```

Replace with:
```tsx
              className="flex items-center gap-2 h-[30px] md:h-[40px] px-3 md:px-4 rounded-[10px] bg-white/5 border border-white/[0.09] active:bg-teal/10 active:border-teal/30 w-full text-left"
```

- [ ] **Step 4: Scale player name text**

Find (line ~41):
```tsx
              <span className="text-[9px] font-semibold text-white/80 flex-1">{p.name}</span>
```

Replace with:
```tsx
              <span className="text-[9px] md:text-[11px] font-semibold text-white/80 flex-1">{p.name}</span>
```

- [ ] **Step 5: Scale player score text**

Find (line ~42):
```tsx
              <span className="text-[8px] font-bold text-white/25">{p.score} pts</span>
```

Replace with:
```tsx
              <span className="text-[8px] md:text-[10px] font-bold text-white/25">{p.score} pts</span>
```

- [ ] **Step 6: Scale the "Nobody got it" button**

Find (line ~49):
```tsx
        <button
          onClick={onNobody}
          className="mt-1 w-full h-[26px] rounded-[9px] border border-white/7 text-white/30 text-[7px] font-semibold flex items-center justify-center gap-1"
```

Replace with:
```tsx
        <button
          onClick={onNobody}
          className="mt-1 w-full h-[26px] md:h-[34px] rounded-[9px] border border-white/7 text-white/30 text-[7px] md:text-[9px] font-semibold flex items-center justify-center gap-1"
```

- [ ] **Step 7: Verify it compiles**

```bash
cd /Users/max/Documents/GitHub/giglz && npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/game/GuesserModal.tsx
git commit -m "feat: responsive guesser modal — scale width, rows, and text at md"
```

---

## Verification

After all tasks:

1. `npx tsc --noEmit` — no errors
2. `npm run build` — builds cleanly
3. Manual smoke test at each breakpoint (use browser DevTools → responsive mode):
   - **iPhone 14 Pro (390×844):** card fills screen height, no visible change from before
   - **iPad 10th gen portrait (820×1180):** card is large, header text readable, buttons taller, no gaps
   - **iPad landscape (1180×820):** card height-bound, fills available space
4. Test the full game flow on each screen size: roll → card reveal → Complete → modal → score
