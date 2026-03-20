'use client'
import { useState } from 'react'
import { DieValue, DIE_MAP } from '@/lib/game/cards'
import { rollDie } from '@/lib/game/engine'

// Dot positions for each face — [col, row] in a 3×3 grid (0-indexed)
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[2,0],[0,2],[2,2]],
  5: [[0,0],[2,0],[1,1],[0,2],[2,2]],
  6: [[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]],
}

function DieFace({ value, color }: { value: DieValue; color: string }) {
  const dots = DOT_POSITIONS[value]
  return (
    <div className="relative w-full h-full p-[18%]">
      <div className="relative w-full h-full grid" style={{ gridTemplate: 'repeat(3,1fr)/repeat(3,1fr)' }}>
        {dots.map(([col, row], i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              width: '55%',
              height: '55%',
              margin: 'auto',
              background: color,
              boxShadow: `0 0 8px ${color}99`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

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
      const rolled = rollDie()
      setRolling(false)
      onRoll(rolled)
    }, 650)
  }

  const challenge = value ? DIE_MAP[value] : null
  const accentColor = value ? challenge!.color : 'var(--purple)'
  const glowColor = value ? `${challenge!.color}55` : 'var(--purple-glow)'

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Die */}
      <button
        onClick={handleRoll}
        disabled={disabled || rolling}
        aria-label={value ? `Die shows ${value}, tap to roll again` : 'Tap to roll'}
        className="relative shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-transform duration-100"
        style={{ width: 140, height: 140 }}
      >
        {/* Glow ring */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            boxShadow: `0 0 ${rolling ? '60px' : '32px'} ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            transition: 'box-shadow 0.3s',
          }}
        />

        {/* Face */}
        <span
          className={`absolute inset-0 rounded-[32px] overflow-hidden flex items-center justify-center ${rolling ? 'animate-[die-roll_650ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}`}
          style={{
            background: value
              ? `linear-gradient(145deg, ${accentColor}22 0%, ${accentColor}0a 100%)`
              : 'linear-gradient(145deg, var(--surface3) 0%, var(--surface2) 100%)',
            border: `2px solid ${value ? accentColor + '66' : 'var(--border-hover)'}`,
          }}
        >
          {rolling ? (
            <span className="font-display font-black text-5xl text-white opacity-60">?</span>
          ) : value ? (
            <DieFace value={value} color={accentColor} />
          ) : (
            <span className="font-display font-black text-5xl" style={{ color: 'var(--text-muted)' }}>
              ?
            </span>
          )}
        </span>
      </button>

      {/* Label */}
      <div className="text-center min-h-[40px] flex flex-col items-center justify-center">
        {rolling ? (
          <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Rolling…
          </span>
        ) : value && challenge ? (
          <>
            <span
              className="font-display font-black text-base tracking-wide"
              style={{ color: accentColor }}
            >
              {challenge.label}
            </span>
            <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Die {value}
            </span>
          </>
        ) : (
          <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Tap to roll
          </span>
        )}
      </div>
    </div>
  )
}
