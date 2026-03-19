'use client'
import { useEffect, useRef, useState } from 'react'
interface TimerBarProps { enabled: boolean; running: boolean; onExpire: () => void }
export function TimerBar({ enabled, running, onExpire }: TimerBarProps) {
  const [seconds, setSeconds] = useState(60)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!enabled || !running) { setSeconds(60); return }
    ref.current = setInterval(() => {
      setSeconds(s => { if (s <= 1) { clearInterval(ref.current!); onExpire(); return 0 } return s - 1 })
    }, 1000)
    return () => clearInterval(ref.current!)
  }, [enabled, running, onExpire])
  if (!enabled) return null
  const pct = (seconds / 60) * 100
  const color = pct > 40 ? 'var(--teal)' : pct > 20 ? '#F97316' : 'var(--pink)'
  return (
    <div className="mx-4 mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-[width] duration-1000 linear"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
    </div>
  )
}
