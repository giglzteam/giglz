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
      {/* Row 1 — identity bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 gap-2">
        <div className="font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">
          GiGLz
        </div>
        <div className="flex-1 flex gap-1.5 justify-center overflow-x-auto scrollbar-none">
          {state.mode === 'solo'
            ? state.players.map((p, i) => {
                const isActive = i === state.currentPlayer
                return (
                  <div
                    key={p.name}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] shrink-0 ${
                      isActive
                        ? 'border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)]'
                        : 'border-white/10 bg-white/[0.06]'
                    }`}
                  >
                    <span>{p.emoji}</span>
                    <span className="text-white/30">·</span>
                    <span
                      className={`max-w-[48px] truncate ${
                        isActive ? 'text-white' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {p.name}
                    </span>
                    <span className="text-white/30">·</span>
                    <span
                      className={`font-display font-black ${
                        isActive ? 'text-teal' : 'text-white/40'
                      }`}
                    >
                      {p.score}
                    </span>
                  </div>
                )
              })
            : state.teams.map((t, i) => {
                const isActive = i === state.currentTeam
                return (
                  <div
                    key={t.name}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] shrink-0 ${
                      isActive
                        ? 'border-teal/45 bg-teal/10 shadow-[0_0_10px_rgba(122,221,218,0.15)]'
                        : 'border-white/10 bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`max-w-[48px] truncate ${
                        isActive ? 'text-white' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {t.name}
                    </span>
                    <span className="text-white/30">·</span>
                    <span
                      className={`font-display font-black ${
                        isActive ? 'text-teal' : 'text-white/40'
                      }`}
                    >
                      {t.score}
                    </span>
                  </div>
                )
              })}
        </div>
        {!isPlusPro && (
          <button
            onClick={onUnlock}
            className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5 shrink-0"
          >
            🔓
          </button>
        )}
      </div>

      {/* Row 2 — challenge bar */}
      <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-surface2 border border-[var(--border)] flex items-center gap-2">
        {!active ? (
          <>
            <div
              className="w-6 h-6 rounded-md font-display font-black text-xs flex items-center justify-center shrink-0 opacity-40"
              style={{ background: '#888' }}
            >
              ?
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Roll to find out</span>
          </>
        ) : challenge ? (
          <>
            <div
              className="w-6 h-6 rounded-md font-display font-black text-xs flex items-center justify-center shrink-0"
              style={{
                background: challenge.color,
                boxShadow: `0 0 8px ${challenge.color}55`,
                color: dieBadgeTextColor,
              }}
            >
              {active}
            </div>
            <span
              className="text-[11px] font-black uppercase tracking-wide shrink-0"
              style={{ color: challenge.color }}
            >
              {challenge.label}
            </span>
            <div className="w-px h-3 bg-white/15 mx-1 shrink-0" />
            <span className="text-[11px] text-[var(--text-secondary)] leading-snug flex-1 min-w-0">
              {challenge.desc}
            </span>
            <span className="text-[11px] font-bold text-teal ml-2 shrink-0">
              {currentPlayerName}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}
