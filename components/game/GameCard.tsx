'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cardImagePath } from '@/lib/game/cards'

interface GameCardProps {
  cardId: number | null
  /** Force face-up (e.g. marketing mockup). Default: starts face-down when cardId is set. */
  faceUp?: boolean
}

export function GameCard({ cardId, faceUp = false }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(faceUp)

  // Reset to face-down whenever a new card is drawn
  useEffect(() => {
    if (!faceUp) setIsFlipped(false)
  }, [cardId, faceUp])

  if (!cardId) return (
    <div className="w-full aspect-[5/7] rounded-3xl bg-surface2 border border-[var(--border)] flex items-center justify-center">
      <span className="font-display text-4xl opacity-10">?</span>
    </div>
  )

  return (
    <div
      className="w-full aspect-[5/7] cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={() => !faceUp && setIsFlipped(f => !f)}
      aria-label={isFlipped ? 'Tap to flip card back' : 'Tap to reveal challenge'}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Back face (visible by default) ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: '0 8px 40px rgba(48,151,209,0.35), 0 0 0 2px rgba(122,221,218,0.2)',
          }}
        >
          <Image
            src="/cards/Back.png"
            alt="Card back"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 90vw, 360px"
            priority
          />
          {/* Tap hint */}
          <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
            <span className="text-white/80 text-[11px] font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide">
              Tap to peek 👁
            </span>
          </div>
        </div>

        {/* ── Front face (challenge card) ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 8px 40px var(--purple-glow), 0 0 0 2px rgba(122,221,218,0.15)',
          }}
        >
          <Image
            src={cardImagePath(cardId)}
            alt={`Giglz card ${cardId}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 90vw, 360px"
          />
          {/* Flip back hint */}
          <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
            <span className="text-white/70 text-[11px] font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide">
              Tap to flip back ↩
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
