'use client'
import { useState, useCallback } from 'react'
import { PlayerSetup, GameOptions } from '@/components/game/PlayerSetup'
import { GameCard } from '@/components/game/GameCard'
import { ModeStrip } from '@/components/game/ModeStrip'
import { Die } from '@/components/game/Die'
import { TimerBar } from '@/components/game/TimerBar'
import { ScoreBar } from '@/components/game/ScoreBar'
import { PaywallGate } from '@/components/game/PaywallGate'
import { WinnerScreen } from '@/components/game/WinnerScreen'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { GameState, CreateGameOptions, createGame, rollDie, drawCard, scoreCard, skipCard, nextTurn, checkWin } from '@/lib/game/engine'
import { ALL_CARD_IDS, FREE_CARD_LIMIT, DieValue } from '@/lib/game/cards'

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)

  const isPlusPro = false
  const cardLimit = isPlusPro ? ALL_CARD_IDS.length : FREE_CARD_LIMIT

  function handleStart(opts: GameOptions) {
    const cardIds = ALL_CARD_IDS.slice(0, cardLimit)
    const state = createGame({ ...opts, cardIds } as CreateGameOptions)
    setGameState(state)
    setCardCount(0)
    setWinner(null)
    setShowPaywall(false)
  }

  function handleRoll(dieValue: DieValue) {
    if (!gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }
    const withDie: GameState = { ...gameState, dieValue: gameState.singleTaskMode ? gameState.singleTaskDie : dieValue }
    setGameState(drawCard(withDie))
    setCardCount(c => c + 1)
  }

  function handleCorrect(scoringIndex?: number) {
    if (!gameState) return
    const scored = scoreCard(gameState, scoringIndex)
    const w = checkWin(scored)
    if (w) { setGameState(scored); setWinner(w); return }
    setGameState(nextTurn(scored))
    const isDare = gameState.dieValue === 6
    const name = isDare
      ? (gameState.mode === 'solo' ? gameState.players[gameState.currentPlayer]?.name : gameState.teams[gameState.currentTeam]?.name)
      : (gameState.mode === 'solo' && scoringIndex !== undefined ? gameState.players[scoringIndex]?.name : gameState.teams[scoringIndex ?? 0]?.name)
    setToast(`${name} +1 🎉`)
  }

  function handleSkip() {
    if (!gameState) return
    setGameState(nextTurn(skipCard(gameState)))
  }

  const handleTimerExpire = useCallback(() => {
    setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
  }, [])

  if (!gameState) return <PlayerSetup isPlusPro={isPlusPro} onStart={handleStart} />
  if (winner) return (
    <WinnerScreen state={gameState} winner={winner}
      onPlayAgain={() => handleStart({ mode: gameState.mode, players: gameState.players, teams: gameState.teams, cardsToWin: gameState.cardsToWin, timerEnabled: gameState.timerEnabled, singleTaskDie: gameState.singleTaskDie })}
      onNewGame={() => setGameState(null)} />
  )

  const isDare = gameState.dieValue === 6
  const currentPlayerName = gameState.mode === 'solo'
    ? gameState.players[gameState.currentPlayer]?.name
    : gameState.teams[gameState.currentTeam]?.players[gameState.teams[gameState.currentTeam]?.currentPlayerIndex]

  return (
    <div className="min-h-dvh bg-bg flex flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-display font-black text-lg bg-gradient-to-r from-teal to-pink bg-clip-text text-transparent">GiGLz</div>
        <button onClick={() => setShowPaywall(true)} className="text-xs font-bold bg-teal text-black rounded-full px-3 py-1.5">🔓 Unlock All</button>
      </div>

      <div className="text-center px-4 pb-2">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
          {gameState.mode === 'teams' ? `${gameState.teams[gameState.currentTeam]?.name} — Performer` : 'Current Player'}
        </div>
        <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">{currentPlayerName}</div>
      </div>

      <ModeStrip dieValue={gameState.dieValue} singleTaskDie={gameState.singleTaskMode ? gameState.singleTaskDie : null} />

      <div className="flex-1 px-4 flex items-center justify-center">
        <div className="w-full max-w-sm"><GameCard cardId={gameState.currentCardId} /></div>
      </div>

      <TimerBar enabled={gameState.timerEnabled && gameState.phase === 'reveal' && !isDare} running={gameState.phase === 'reveal'} onExpire={handleTimerExpire} />
      <ScoreBar state={gameState} />

      <div className="px-4 pt-2 pb-4">
        {gameState.phase === 'rolling' ? (
          <div className="flex flex-col items-center gap-4">
            {!gameState.singleTaskMode && <Die value={gameState.dieValue} onRoll={handleRoll} />}
            <Button variant="roll" onClick={() => handleRoll(rollDie())}>🎲 &nbsp;ROLL &amp; DRAW</Button>
          </div>
        ) : isDare ? (
          /* Die 6 — Dare: performer scores if they complete it */
          <div className="flex gap-3">
            <Button variant="skip" onClick={handleSkip}>Skip →</Button>
            <Button variant="correct" onClick={() => handleCorrect()}>Done ✓</Button>
          </div>
        ) : (
          /* Die 1–5: the guesser scores */
          <div className="flex flex-col gap-3">
            <p className="text-center text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
              Who guessed it?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {gameState.mode === 'solo'
                ? gameState.players
                    .map((p, i) => ({ ...p, i }))
                    .filter(p => p.i !== gameState.currentPlayer)
                    .map(p => (
                      <Button key={p.i} variant="correct" className="flex-none text-sm px-4" onClick={() => handleCorrect(p.i)}>
                        {p.emoji} {p.name}
                      </Button>
                    ))
                : gameState.teams
                    .map((t, i) => ({ ...t, i }))
                    .filter(t => t.i !== gameState.currentTeam)
                    .map(t => (
                      <Button key={t.i} variant="correct" className="flex-none text-sm px-4" onClick={() => handleCorrect(t.i)}>
                        {t.name}
                      </Button>
                    ))
              }
            </div>
            <Button variant="skip" onClick={handleSkip}>Nobody got it →</Button>
          </div>
        )}
      </div>

      {showPaywall && <PaywallGate onDismiss={() => setShowPaywall(false)} />}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
