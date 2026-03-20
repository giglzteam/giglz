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
