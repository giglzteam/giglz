# Responsive Game Layout — Multi-Screen Scaling

**Date:** 2026-03-20
**Status:** Approved
**Scope:** `PlayGame.tsx`, `Header.tsx`, `Button.tsx`, `GuesserModal.tsx`

---

## Goal

Make the game screen scale gracefully across all screen sizes. Currently hard-coded `maxWidth: 320` on the card and fixed micro-sized text in the header produce a small card with large gaps on iPad. The fix scales the card to fill available space and adds responsive text/spacing breakpoints throughout.

---

## Approved Layout Behaviour

### Card sizing

The card wrapper uses height-driven sizing (parent flex-1 → height → aspect-ratio 5:7 derives width). The only change: remove the `maxWidth: 320` inline cap and replace with `max-w-full`. The card now grows to fill available height on any screen.

| Screen | Before | After |
|--------|--------|-------|
| iPhone 14 Pro (390px) | 320 × 448px | ~358 × 501px |
| iPad 10th gen portrait (820px) | 320 × 448px | ~714 × 1000px (height-bound) |
| iPad landscape (1180px) | 320 × 448px | fills available height |

### Breakpoints

Only `md` (768px) is required — covers iPad portrait and above. `lg` added where content benefits from extra breathing room.

---

## Change 1 — Card Wrapper (`PlayGame.tsx`)

Single line change in the card container:

```tsx
// Before
<div className="h-full" style={{ aspectRatio: '5 / 7', maxWidth: 320 }}>

// After
<div className="h-full max-w-full" style={{ aspectRatio: '5 / 7' }}>
```

Scale the card area wrapper padding (prevents card from crowding header/buttons at tablet sizes):
```tsx
// Before
<div className="flex-1 min-h-0 px-4 py-1 flex items-center justify-center overflow-hidden">

// After
<div className="flex-1 min-h-0 px-4 md:px-6 py-1 md:py-3 flex items-center justify-center overflow-hidden">
```

Also scale bottom section padding:
```tsx
// Before
<div className="px-4 pt-2 pb-3 shrink-0">

// After
<div className="px-4 md:px-8 pt-2 pb-3 md:pb-6 shrink-0">
```

---

## Change 2 — Header (`Header.tsx`)

### Row 1 — ranked pills

Outer wrapper padding:
```tsx
// Before
<div className="flex items-center justify-between px-4 pt-2 pb-1 gap-2">

// After
<div className="flex items-center justify-between px-4 md:px-8 pt-2 md:pt-3 pb-1 md:pb-2 gap-2">
```

Each chip — badge size and text. **Apply to both the solo `map` branch AND the teams `map` branch** (they are structurally identical; both must be updated):
```tsx
// Badge: before
<div className="w-[13px] h-[13px] ... text-[6px] ...">

// Badge: after
<div className="w-[13px] h-[13px] md:w-4 md:h-4 ... text-[6px] md:text-[8px] ...">

// Name span: before
<span className="text-[7px] font-semibold ...">

// Name span: after
<span className="text-[7px] md:text-[9px] font-semibold ...">

// Score span: before
<span className="text-[7px] font-black ...">

// Score span: after
<span className="text-[7px] md:text-[9px] font-black ...">
```

### Row 2 — challenge bar

Wrapper margin and padding:
```tsx
// Before
<div className="mx-4 mb-2 px-3 py-2 rounded-xl ...">

// After
<div className="mx-4 md:mx-8 mb-2 md:mb-3 px-3 md:px-4 py-2 md:py-3 rounded-xl ...">
```

Die badge size:
```tsx
// Before
<div className="w-6 h-6 ... text-xs ...">

// After
<div className="w-6 h-6 md:w-8 md:h-8 ... text-xs md:text-sm ...">
```

Challenge label, description, player name, and "Roll to find out" text — **4 instances** of `text-[11px]` in Row 2:
```tsx
// Before: text-[11px] (×4 — "Roll to find out", challenge label, challenge desc, currentPlayerName)
// After:  text-[11px] md:text-[13px] (×4 — all four instances)
```

---

## Change 3 — Button (`Button.tsx`)

Base button height and text scale up at `md`:

```tsx
// Before
'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 ...'

// After
'inline-flex items-center justify-center gap-2 min-h-[48px] md:min-h-[56px] px-6 md:px-8 md:text-base ...'
```

---

## Change 4 — GuesserModal (`GuesserModal.tsx`)

Modal card max-width grows on tablet:
```tsx
// Before
className="... w-full max-w-xs ..."

// After
className="... w-full max-w-xs md:max-w-sm ..."
```

"Who guessed it?" heading:
```tsx
// Before
className="text-[8px] uppercase ..."

// After
className="text-[8px] md:text-[10px] uppercase ..."
```

Player row height scales:
```tsx
// Before
className="... h-[30px] ..."

// After
className="... h-[30px] md:h-[40px] ..."
```

Player name and score text:
```tsx
// name: text-[9px] → text-[9px] md:text-[11px]
// score: text-[8px] → text-[8px] md:text-[10px]
```

"Nobody got it" button:
```tsx
// Before
className="mt-1 w-full h-[26px] ... text-[7px] ..."

// After
className="mt-1 w-full h-[26px] md:h-[34px] ... text-[7px] md:text-[9px] ..."
```

---

## What stays the same

- Game engine, state, routing — no changes
- Visual design language, colours, shadows — no changes
- GameCard flip animation and image sizing — no changes
- WinnerScreen, PlayerSetup, PaywallGate — no changes
- Layout structure (h-dvh flex flex-col) — no changes
