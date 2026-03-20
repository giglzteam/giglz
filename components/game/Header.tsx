'use client'

import { GameState } from '@/lib/game/engine'
import { DIE_MAP } from '@/lib/game/cards'

interface HeaderProps {
  state: GameState
  currentPlayerName: string
  isPlusPro: boolean
  onUnlock: () => void
}

export function Header({ state, currentPlayerName, isPlusPro, onUnlock }: HeaderProps) {
  const active = state.singleTaskMode ? state.singleTaskDie : state.dieValue
  const challenge = active ? DIE_MAP[active] : null
  const dieBadgeTextColor = active === 2 || active === 5 ? '#000' : '#fff'

  return (
    <div className="shrink-0">
      {/* Row 1 — ranked leaderboard */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-2 md:pt-3 pb-1 md:pb-2 gap-2">
        <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-none">
          {(state.mode === 'solo'
            ? [...state.players]
                .map((p, i) => ({ name: p.name, score: p.score, emoji: p.emoji, originalIndex: i }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((p, rank) => {
                  const isLeader = rank === 0
                  // Gold takes precedence: leader chip uses gold styling even if they are also the active-turn player
                  const isActiveTurn = !isLeader && p.originalIndex === state.currentPlayer
                  return (
                    <div
                      key={String(p.originalIndex)}
                      className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 border flex-1 min-w-0 overflow-hidden ${
                        isLeader
                          ? 'border-yellow-400/35 bg-yellow-400/[0.06]'
                          : isActiveTurn
                          ? 'border-teal/35 bg-teal/[0.06]'
                          : 'border-white/8 bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-[13px] h-[13px] md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-black shrink-0 ${
                        isLeader ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/7 text-white/35'
                      }`}>
                        {rank + 1}
                      </div>
                      <span className={`text-[7px] md:text-[9px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
                        isLeader ? 'text-white/85' : isActiveTurn ? 'text-teal' : 'text-white/50'
                      }`}>
                        {p.name}
                      </span>
                      <span className={`text-[7px] md:text-[9px] font-black shrink-0 ${
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
                  // Gold takes precedence: leader chip uses gold styling even if they are also the active-turn team
                  const isActiveTurn = !isLeader && t.originalIndex === state.currentTeam
                  return (
                    <div
                      key={String(t.originalIndex)}
                      className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 border flex-1 min-w-0 overflow-hidden ${
                        isLeader
                          ? 'border-yellow-400/35 bg-yellow-400/[0.06]'
                          : isActiveTurn
                          ? 'border-teal/35 bg-teal/[0.06]'
                          : 'border-white/8 bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-[13px] h-[13px] md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-black shrink-0 ${
                        isLeader ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/7 text-white/35'
                      }`}>
                        {rank + 1}
                      </div>
                      <span className={`text-[7px] md:text-[9px] font-semibold flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
                        isLeader ? 'text-white/85' : isActiveTurn ? 'text-teal' : 'text-white/50'
                      }`}>
                        {t.name}
                      </span>
                      <span className={`text-[7px] md:text-[9px] font-black shrink-0 ${
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

      {/* Row 2 — challenge bar */}
      <div className="mx-4 md:mx-8 mb-2 md:mb-3 px-3 md:px-4 py-2 md:py-3 rounded-xl bg-surface2 border border-[var(--border)] flex items-center gap-2">
        {state.phase === 'rolling' ? (
          <>
            <div
              className="w-6 h-6 md:w-8 md:h-8 rounded-md font-display font-black text-xs md:text-sm flex items-center justify-center shrink-0 opacity-40 bg-white/20"
            >
              ?
            </div>
            <span className="text-[11px] md:text-[13px] text-[var(--text-muted)]">Roll to find out</span>
          </>
        ) : challenge ? (
          <>
            <div
              className="w-6 h-6 md:w-8 md:h-8 rounded-md font-display font-black text-xs md:text-sm flex items-center justify-center shrink-0"
              style={{
                background: challenge.color,
                boxShadow: `0 0 8px ${challenge.color}55`,
                color: dieBadgeTextColor,
              }}
            >
              {active}
            </div>
            <span
              className="text-[11px] md:text-[13px] font-black uppercase tracking-wide shrink-0"
              style={{ color: challenge.color }}
            >
              {challenge.label}
            </span>
            <div className="w-px h-3 bg-white/15 mx-1 shrink-0" />
            <span className="text-[11px] md:text-[13px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0">
              {challenge.desc}
            </span>
            <span className="text-[11px] md:text-[13px] font-bold text-teal ml-2 shrink-0">
              {currentPlayerName}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}
