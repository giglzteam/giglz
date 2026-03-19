import { DieValue } from './cards'

export type GameMode = 'solo' | 'teams'

export interface Player {
  name: string
  emoji: string
  score: number
}

export interface Team {
  name: string
  players: string[]
  score: number
  currentPlayerIndex: number
}

export interface GameState {
  mode: GameMode
  players: Player[]
  teams: Team[]
  currentTeam: number
  currentPlayer: number
  deck: number[]
  deckIndex: number
  currentCardId: number | null
  dieValue: DieValue | null
  phase: 'setup' | 'rolling' | 'reveal' | 'scoring' | 'finished'
  timerEnabled: boolean
  timerSeconds: number
  cardsToWin: number
  singleTaskMode: boolean
  singleTaskDie: DieValue | null
  winner: string | null
}

export interface CreateGameOptions {
  mode: GameMode
  players: { name: string; emoji: string }[]
  teams: { name: string; players: string[] }[]
  cardIds: number[]
  cardsToWin: number
  timerEnabled: boolean
  singleTaskDie?: DieValue | null
}

/** Fisher-Yates shuffle — returns new array, does not mutate input */
export function shuffleDeck(ids: number[]): number[] {
  const deck = [...ids]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function createGame(opts: CreateGameOptions): GameState {
  return {
    mode: opts.mode,
    players: opts.players.map(p => ({ ...p, score: 0 })),
    teams: opts.teams.map(t => ({ ...t, score: 0, currentPlayerIndex: 0 })),
    currentTeam: 0,
    currentPlayer: 0,
    deck: shuffleDeck(opts.cardIds),
    deckIndex: 0,
    currentCardId: null,
    dieValue: null,
    phase: 'rolling',
    timerEnabled: opts.timerEnabled,
    timerSeconds: 60,
    cardsToWin: opts.cardsToWin,
    singleTaskMode: !!opts.singleTaskDie,
    singleTaskDie: opts.singleTaskDie ?? null,
    winner: null,
  }
}

export function rollDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue
}

export function drawCard(state: GameState): GameState {
  let { deck, deckIndex } = state
  if (deckIndex >= deck.length) {
    deck = shuffleDeck(deck)
    deckIndex = 0
  }
  return {
    ...state,
    deck,
    deckIndex: deckIndex + 1,
    currentCardId: deck[deckIndex],
    phase: 'reveal',
    timerSeconds: 60,
  }
}

export function scoreCard(state: GameState): GameState {
  if (state.mode === 'solo') {
    const players = state.players.map((p, i) =>
      i === state.currentPlayer ? { ...p, score: p.score + 1 } : p
    )
    return { ...state, players, phase: 'scoring' }
  } else {
    const teams = state.teams.map((t, i) =>
      i === state.currentTeam ? { ...t, score: t.score + 1 } : t
    )
    return { ...state, teams, phase: 'scoring' }
  }
}

export function skipCard(state: GameState): GameState {
  return { ...state, phase: 'scoring' }
}

export function nextTurn(state: GameState): GameState {
  if (state.mode === 'solo') {
    const currentPlayer = (state.currentPlayer + 1) % state.players.length
    return { ...state, currentPlayer, dieValue: null, currentCardId: null, phase: 'rolling' }
  } else {
    const currentTeam = (state.currentTeam + 1) % state.teams.length
    const teams = state.teams.map((t, i) =>
      i === state.currentTeam
        ? { ...t, currentPlayerIndex: (t.currentPlayerIndex + 1) % t.players.length }
        : t
    )
    return { ...state, teams, currentTeam, dieValue: null, currentCardId: null, phase: 'rolling' }
  }
}

export function checkWin(state: GameState): string | null {
  if (state.mode === 'solo') {
    const winner = state.players.find(p => p.score >= state.cardsToWin)
    return winner?.name ?? null
  } else {
    const winner = state.teams.find(t => t.score >= state.cardsToWin)
    return winner?.name ?? null
  }
}
