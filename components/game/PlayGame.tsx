'use client'
import { useState, useCallback } from 'react'
import { PlayerSetup, GameOptions } from '@/components/game/PlayerSetup'
import { GameCard } from '@/components/game/GameCard'
import { TimerBar } from '@/components/game/TimerBar'
import { Header } from '@/components/game/Header'
import { PaywallGate } from '@/components/game/PaywallGate'
import { WinnerScreen } from '@/components/game/WinnerScreen'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { GuesserModal } from '@/components/game/GuesserModal'
import { GameState, CreateGameOptions, createGame, rollDie, drawCard, scoreCard, skipCard, nextTurn, checkWin } from '@/lib/game/engine'
import { ALL_CARD_IDS, FREE_CARD_LIMIT, DieValue } from '@/lib/game/cards'

interface PlayGameProps {
  isPlusPro: boolean
}

export function PlayGame({ isPlusPro }: PlayGameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const [showGuesserModal, setShowGuesserModal] = useState(false)

  const cardLimit = isPlusPro ? ALL_CARD_IDS.length : FREE_CARD_LIMIT

  function handleStart(opts: GameOptions) {
    const cardIds = ALL_CARD_IDS.slice(0, cardLimit)
    const state = createGame({ ...opts, cardIds } as CreateGameOptions)
    setGameState(state)
    setCardCount(0)
    setWinner(null)
    setShowPaywall(false)
    setShowGuesserModal(false)
  }

  function handleRoll(dieValue: DieValue) {
    if (!gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }
    const withDie: GameState = { ...gameState, dieValue: gameState.singleTaskMode ? gameState.singleTaskDie : dieValue }
    setGameState(drawCard(withDie))
    setCardCount(c => c + 1)
  }

  function handleRollButton() {
    if (rolling || !gameState) return
    if (cardCount >= cardLimit) { setShowPaywall(true); return }
    setShowGuesserModal(false)
    setRolling(true)
    setTimeout(() => {
      setRolling(false)
      handleRoll(rollDie())
    }, 650)
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
      : (gameState.mode === 'solo' && scoringIndex !== undefined ? gameState.players[scoringIndex]?.name : gameState.teams[scoringIndex ?? 0]?.name) // scoringIndex is always defined for teams (GuesserModal always passes it)
    setToast(`${name} +1 🎉`)
  }

  function handleSkip() {
    if (!gameState) return
    setGameState(nextTurn(skipCard(gameState)))
  }

  const handleTimerExpire = useCallback(() => {
    setShowGuesserModal(false)
    setGameState(prev => prev ? nextTurn(skipCard(prev)) : prev)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // setGameState is a stable useState setter — safe to omit from deps

  if (!gameState) return <PlayerSetup isPlusPro={isPlusPro} onStart={handleStart} />
  if (winner) return (
    <WinnerScreen state={gameState} winner={winner}
      onPlayAgain={() => handleStart({ mode: gameState.mode, players: gameState.players, teams: gameState.teams, cardsToWin: gameState.cardsToWin, timerEnabled: gameState.timerEnabled, singleTaskDie: gameState.singleTaskDie })}
      onNewGame={() => setGameState(null)} />
  )

  const isDare = gameState.dieValue === 6
  const team = gameState.teams[gameState.currentTeam]
  const currentPlayerName = gameState.mode === 'solo'
    ? gameState.players[gameState.currentPlayer]?.name ?? ''
    : team?.players[team?.currentPlayerIndex] ?? ''

  return (
    <div className="h-dvh bg-bg flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <Header
        state={gameState}
        currentPlayerName={currentPlayerName}
        isPlusPro={isPlusPro}
        onUnlock={() => setShowPaywall(true)}
      />

      <div className="flex-1 min-h-0 px-4 md:px-6 py-1 md:py-3 flex items-center justify-center overflow-hidden">
        {/* Height-driven sizing: parent height → width via aspect-ratio, preventing overflow */}
        <div className="h-full max-w-full" style={{ aspectRatio: '5 / 7' }}>
          <GameCard cardId={gameState.currentCardId} />
        </div>
      </div>

      <TimerBar enabled={gameState.timerEnabled && gameState.phase === 'reveal' && !isDare} running={gameState.phase === 'reveal'} onExpire={handleTimerExpire} />

      <div className="px-4 md:px-8 pt-2 pb-3 md:pb-6 shrink-0">
        {gameState.phase === 'rolling' ? (
          <Button
            variant="roll"
            disabled={rolling}
            onClick={handleRollButton}
            className={rolling ? 'opacity-80' : ''}
          >
            <span
              className={rolling ? 'animate-[die-roll_650ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
              style={{ display: 'inline-block' }}
            >
              🎲
            </span>
            &nbsp;{rolling ? 'ROLLING…' : 'ROLL & DRAW'}
          </Button>
        ) : isDare ? (
          /* Die 6 — Dare: performer scores if they complete it */
          <div className="flex gap-3">
            <Button variant="skip" onClick={handleSkip}>Skip →</Button>
            <Button variant="correct" onClick={() => handleCorrect()}>Done ✓</Button>
          </div>
        ) : (
          /* Die 1–5: tap Complete to open scorer picker */
          <Button variant="correct" className="w-full" onClick={() => setShowGuesserModal(true)}>
            ✓ COMPLETE
          </Button>
        )}
      </div>

      {showPaywall && <PaywallGate onDismiss={() => setShowPaywall(false)} />}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {showGuesserModal && gameState && (
        <GuesserModal
          state={gameState}
          onScore={(i) => { setShowGuesserModal(false); handleCorrect(i) }}
          onNobody={() => { setShowGuesserModal(false); handleSkip() }}
          onClose={() => setShowGuesserModal(false)}
        />
      )}
    </div>
  )
}
