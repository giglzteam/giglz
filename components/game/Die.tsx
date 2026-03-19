'use client'
import { useState } from 'react'
import { DieValue } from '@/lib/game/cards'
import { rollDie } from '@/lib/game/engine'
interface DieProps { value: DieValue | null; onRoll: (value: DieValue) => void; disabled?: boolean }
export function Die({ value, onRoll, disabled }: DieProps) {
  const [rolling, setRolling] = useState(false)
  function handleRoll() {
    if (disabled || rolling) return
    setRolling(true)
    setTimeout(() => { const rolled = rollDie(); setRolling(false); onRoll(rolled) }, 600)
  }
  return (
    <button onClick={handleRoll} disabled={disabled || rolling} aria-label={value ? `Die shows ${value}` : 'Roll die'}
      className={`w-20 h-20 rounded-[20px] flex items-center justify-center font-display font-black text-4xl text-white cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 ${rolling ? 'animate-[die-roll_600ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}`}
      style={{ background: 'var(--purple)', boxShadow: '0 0 32px var(--purple-glow), 4px 4px 0 var(--purple-deep), 0 10px 30px rgba(0,0,0,0.5)' }}>
      {rolling ? '?' : (value ?? '🎲')}
    </button>
  )
}
