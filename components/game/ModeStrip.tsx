import { DieValue, DIE_MAP } from '@/lib/game/cards'
interface ModeStripProps { dieValue: DieValue | null; singleTaskDie?: DieValue | null }
export function ModeStrip({ dieValue, singleTaskDie }: ModeStripProps) {
  const active = singleTaskDie ?? dieValue
  if (!active) return (
    <div className="mx-4 mb-3 bg-surface2 border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3 opacity-40">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">🎲</div>
      <div><div className="font-display font-black text-xs tracking-wide text-white/50 uppercase">Roll to find out...</div><div className="text-xs text-[var(--text-muted)] mt-0.5">Tap the button below</div></div>
    </div>
  )
  const challenge = DIE_MAP[active]
  return (
    <div className="mx-4 mb-3 bg-surface2 border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-2xl shrink-0"
        style={{ background: challenge.color, boxShadow: `0 0 20px ${challenge.color}55`, color: active === 2 || active === 5 ? '#000' : '#fff' }}>
        {active}
      </div>
      <div>
        <div className="font-display font-black text-xs tracking-wide uppercase mb-0.5" style={{ color: challenge.color }}>{challenge.label}</div>
        <div className="text-xs text-[var(--text-secondary)] leading-snug">{challenge.desc}</div>
      </div>
    </div>
  )
}
