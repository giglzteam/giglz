import {
  createGame, rollDie, drawCard, scoreCard, skipCard,
  nextTurn, checkWin, shuffleDeck
} from '@/lib/game/engine'
import { ALL_CARD_IDS } from '@/lib/game/cards'

describe('shuffleDeck', () => {
  it('returns all card IDs exactly once', () => {
    const shuffled = shuffleDeck(ALL_CARD_IDS)
    expect(shuffled).toHaveLength(ALL_CARD_IDS.length)
    expect(new Set(shuffled).size).toBe(ALL_CARD_IDS.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual([...ALL_CARD_IDS].sort((a, b) => a - b))
  })

  it('does not mutate the input array', () => {
    const original = [...ALL_CARD_IDS]
    shuffleDeck(ALL_CARD_IDS)
    expect(ALL_CARD_IDS).toEqual(original)
  })
})

describe('createGame', () => {
  it('creates solo game with shuffled deck starting in rolling phase', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    expect(state.phase).toBe('rolling')
    expect(state.deck).toHaveLength(ALL_CARD_IDS.length)
    expect(state.deckIndex).toBe(0)
    expect(state.players[0].score).toBe(0)
    expect(state.players[1].score).toBe(0)
  })
})

describe('rollDie', () => {
  it('returns value between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const val = rollDie()
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(6)
    }
  })
})

describe('drawCard', () => {
  it('advances deckIndex and sets currentCardId, phase becomes reveal', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = drawCard({ ...state, dieValue: 1 })
    expect(next.currentCardId).toBe(state.deck[0])
    expect(next.deckIndex).toBe(1)
    expect(next.phase).toBe('reveal')
  })

  it('reshuffles when deck is exhausted', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: [26, 27, 28],
      cardsToWin: 100,
      timerEnabled: false,
    })
    // exhaust deck
    const s = { ...state, deckIndex: 3 }
    const next = drawCard({ ...s, dieValue: 1 })
    expect(next.deckIndex).toBe(1)  // reshuffled, drew index 0
  })
})

describe('scoreCard', () => {
  it('increments current player score in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = scoreCard(state)
    expect(next.players[0].score).toBe(1)
    expect(next.players[1].score).toBe(0)
    expect(next.phase).toBe('scoring')
  })

  it('increments current team score in teams mode', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = scoreCard({ ...state, currentTeam: 0 })
    expect(next.teams[0].score).toBe(1)
    expect(next.teams[1].score).toBe(0)
  })
})

describe('checkWin', () => {
  it('returns winner name when score reaches cardsToWin in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 3,
      timerEnabled: false,
    })
    const s = { ...state, players: [{ name: 'Alice', emoji: '😎', score: 3 }] }
    expect(checkWin(s)).toBe('Alice')
  })

  it('returns null when no winner in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    expect(checkWin(state)).toBeNull()
  })

  it('returns winning team name in teams mode', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 3,
      timerEnabled: false,
    })
    const s = { ...state, teams: [{ name: 'Red', players: ['Alice'], score: 3, currentPlayerIndex: 0 }, { name: 'Blue', players: ['Bob'], score: 0, currentPlayerIndex: 0 }] }
    expect(checkWin(s)).toBe('Red')
  })
})

describe('nextTurn', () => {
  it('rotates currentPlayer in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = nextTurn({ ...state, currentPlayer: 0 })
    expect(next.currentPlayer).toBe(1)
    expect(next.phase).toBe('rolling')
    expect(next.dieValue).toBeNull()
  })

  it('wraps around to first player in solo mode', () => {
    const state = createGame({
      mode: 'solo',
      players: [{ name: 'Alice', emoji: '😎' }, { name: 'Bob', emoji: '🔥' }],
      teams: [],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = nextTurn({ ...state, currentPlayer: 1 })
    expect(next.currentPlayer).toBe(0)
  })

  it('rotates currentTeam in teams mode', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice', 'Carol'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    const next = nextTurn({ ...state, currentTeam: 0 })
    expect(next.currentTeam).toBe(1)
    expect(next.phase).toBe('rolling')
  })

  it('advances currentPlayerIndex within team after full rotation', () => {
    const state = createGame({
      mode: 'teams',
      players: [],
      teams: [{ name: 'Red', players: ['Alice', 'Carol'] }, { name: 'Blue', players: ['Bob'] }],
      cardIds: ALL_CARD_IDS,
      cardsToWin: 10,
      timerEnabled: false,
    })
    // Red's turn → Blue
    const next1 = nextTurn({ ...state, currentTeam: 0 })
    // Blue's turn → Red (Red's second player)
    const next2 = nextTurn({ ...next1, currentTeam: 1 })
    expect(next2.currentTeam).toBe(0)
    expect(next2.teams[0].currentPlayerIndex).toBe(1)
  })
})
