import Image from 'next/image'
import { cardImagePath } from '@/lib/game/cards'
interface GameCardProps { cardId: number | null }
export function GameCard({ cardId }: GameCardProps) {
  if (!cardId) return (
    <div className="w-full aspect-[5/7] rounded-3xl bg-surface2 border border-[var(--border)] flex items-center justify-center">
      <span className="font-display text-4xl opacity-10">?</span>
    </div>
  )
  return (
    <div className="w-full aspect-[5/7] relative rounded-3xl overflow-hidden animate-[card-in_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ boxShadow: '0 8px 40px var(--purple-glow), 0 0 0 2px rgba(122,221,218,0.15)' }}>
      <Image src={cardImagePath(cardId)} alt={`Giglz card ${cardId}`} fill className="object-cover" priority sizes="(max-width: 640px) 90vw, 360px" />
    </div>
  )
}
