import { GameState } from '@/lib/game/engine'
import { Button } from '@/components/ui/Button'
interface WinnerScreenProps { state: GameState; winner: string; onPlayAgain: () => void; onNewGame: () => void }
export function WinnerScreen({ state, winner, onPlayAgain, onNewGame }: WinnerScreenProps) {
  const scores = state.mode === 'solo'
    ? state.players.map(p => ({ name: p.name, score: p.score, emoji: p.emoji })).sort((a, b) => b.score - a.score)
    : state.teams.map(t => ({ name: t.name, score: t.score, emoji: '🏆' })).sort((a, b) => b.score - a.score)
  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Winner!</div>
      <div className="text-5xl">{scores[0]?.emoji ?? '🏆'}</div>
      <div className="font-display font-black text-2xl text-teal">{winner}</div>
      <div className="text-sm text-[var(--text-secondary)]">with {scores[0]?.score} cards</div>
      <div className="w-full max-w-xs mt-4 space-y-2">
        {scores.map((s, i) => (
          <div key={s.name} className="flex justify-between items-center bg-surface2 rounded-xl px-4 py-2.5">
            <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {s.name}</span>
            <span className="font-display font-black text-sm" style={{ color: i === 0 ? 'var(--teal)' : 'white' }}>{s.score}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs mt-4 space-y-3">
        <Button variant="roll" onClick={onPlayAgain}>Play Again 🎲</Button>
        <button onClick={onNewGame} className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-2 cursor-pointer">New Game</button>
      </div>
    </div>
  )
}
