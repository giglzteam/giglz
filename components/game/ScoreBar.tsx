import { GameState } from '@/lib/game/engine'
export function ScoreBar({ state }: { state: GameState }) {
  if (state.mode === 'solo') return (
    <div className="flex justify-around items-center px-4 py-2 border-t border-[var(--border)] bg-surface1">
      {state.players.map((p, i) => (
        <div key={p.name} className="flex flex-col items-center gap-0.5">
          <span className={`text-lg ${i === state.currentPlayer ? 'drop-shadow-[0_0_8px_var(--teal)]' : ''}`}>{p.emoji}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold ${i === state.currentPlayer ? 'text-teal' : 'text-[var(--text-muted)]'}`}>{p.name}</span>
          <span className={`font-display font-black text-sm ${i === state.currentPlayer ? 'text-teal' : 'text-white'}`}>{p.score}</span>
        </div>
      ))}
    </div>
  )
  return (
    <div className="flex justify-around items-center px-4 py-2 border-t border-[var(--border)] bg-surface1">
      {state.teams.map((t, i) => (
        <div key={t.name} className="flex flex-col items-center gap-0.5">
          <span className={`text-[9px] uppercase tracking-widest font-semibold ${i === state.currentTeam ? 'text-teal' : 'text-[var(--text-muted)]'}`}>{t.name}</span>
          <span className={`font-display font-black text-lg ${i === state.currentTeam ? 'text-teal' : 'text-white'}`}>{t.score}</span>
          <span className="text-[8px] text-[var(--text-muted)]">{t.players[t.currentPlayerIndex]}&apos;s turn</span>
        </div>
      ))}
    </div>
  )
}
