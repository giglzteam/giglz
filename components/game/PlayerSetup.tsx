'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { GameMode } from '@/lib/game/engine'
import { DieValue, DIE_MAP } from '@/lib/game/cards'

const EMOJIS = ['😎','🔥','⚡','🎮','🎉','🤩','😈','🦁','🐯','🦊','👾','🤖']

interface SetupPlayer { name: string; emoji: string }
export interface GameOptions {
  mode: GameMode
  players: SetupPlayer[]
  teams: { name: string; players: string[] }[]
  cardsToWin: number
  timerEnabled: boolean
  singleTaskDie: DieValue | null
}
interface PlayerSetupProps { isPlusPro: boolean; onStart: (opts: GameOptions) => void }

export function PlayerSetup({ isPlusPro, onStart }: PlayerSetupProps) {
  const [mode, setMode] = useState<GameMode>('solo')
  const [players, setPlayers] = useState<SetupPlayer[]>([{ name: '', emoji: '😎' }, { name: '', emoji: '🔥' }])
  const [teamCount] = useState(2)
  const [cardsToWin, setCardsToWin] = useState(10)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [singleTaskDie, setSingleTaskDie] = useState<DieValue | null>(null)
  const [emojiPickerFor, setEmojiPickerFor] = useState<number | null>(null)

  function addPlayer() {
    if (players.length >= (isPlusPro ? 12 : 4)) return
    setPlayers(p => [...p, { name: '', emoji: EMOJIS[p.length % EMOJIS.length] }])
  }
  function removePlayer(i: number) {
    if (players.length <= 2) return
    setPlayers(p => p.filter((_, idx) => idx !== i))
  }
  function buildTeams() {
    const named = players.filter(p => p.name.trim())
    const teams: { name: string; players: string[] }[] = Array.from({ length: teamCount }, (_, i) => ({ name: `Team ${i + 1}`, players: [] }))
    named.forEach((p, i) => teams[i % teamCount].players.push(p.name.trim()))
    return teams
  }
  function handleStart() {
    const validPlayers = players.filter(p => p.name.trim())
    if (validPlayers.length < 2) return
    onStart({ mode, players: validPlayers, teams: mode === 'teams' ? buildTeams() : [], cardsToWin, timerEnabled, singleTaskDie })
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col p-5 gap-5 pb-[env(safe-area-inset-bottom)]">
      <div className="font-display font-black text-xl bg-gradient-to-r from-teal to-white bg-clip-text text-transparent">GiGLz</div>

      <div>
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Game Mode</div>
        <div className="flex gap-2">
          <button onClick={() => setMode('solo')} className={`flex-1 py-3 rounded-2xl text-sm font-display font-black transition-all ${mode === 'solo' ? 'bg-purple text-white shadow-[0_0_20px_var(--purple-glow)]' : 'bg-surface2 text-[var(--text-secondary)] border border-[var(--border)]'}`}>Solo</button>
          <button onClick={() => isPlusPro && setMode('teams')} className={`flex-1 py-3 rounded-2xl text-sm font-display font-black transition-all relative ${mode === 'teams' ? 'bg-purple text-white shadow-[0_0_20px_var(--purple-glow)]' : 'bg-surface2 text-[var(--text-secondary)] border border-[var(--border)]'} ${!isPlusPro ? 'opacity-50' : ''}`}>
            Teams {!isPlusPro && <span className="text-[8px] absolute top-1 right-2 text-pink">Plus</span>}
          </button>
        </div>
      </div>

      <div>
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Players</div>
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setEmojiPickerFor(i === emojiPickerFor ? null : i)} className="w-12 h-12 rounded-xl bg-surface2 border border-[var(--border)] flex items-center justify-center text-2xl shrink-0 hover:border-[var(--border-hover)] transition-colors">{p.emoji}</button>
              <input type="text" value={p.name} onChange={e => setPlayers(ps => ps.map((pl, idx) => idx === i ? { ...pl, name: e.target.value } : pl))}
                placeholder={`Player ${i + 1}`} className="flex-1 bg-surface2 border border-[var(--border)] rounded-xl px-4 h-12 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-teal focus:shadow-[0_0_0_3px_var(--teal-glow)] transition-all" />
              {players.length > 2 && <button onClick={() => removePlayer(i)} className="w-8 h-8 rounded-lg bg-surface2 text-[var(--text-muted)] flex items-center justify-center hover:text-pink transition-colors text-sm">✕</button>}
            </div>
          ))}
          {emojiPickerFor !== null && (
            <div className="flex flex-wrap gap-2 p-3 bg-surface2 border border-[var(--border)] rounded-2xl">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { setPlayers(ps => ps.map((pl, i) => i === emojiPickerFor ? { ...pl, emoji: e } : pl)); setEmojiPickerFor(null) }}
                  className="w-10 h-10 rounded-lg bg-surface3 flex items-center justify-center text-xl hover:scale-110 transition-transform">{e}</button>
              ))}
            </div>
          )}
          {players.length < (isPlusPro ? 12 : 4) && (
            <button onClick={addPlayer} className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] text-sm hover:border-[var(--border-hover)] transition-colors">+ Add Player</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Options</div>
        <div className="flex items-center justify-between bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div><div className="text-sm font-semibold">60s Timer</div><div className="text-xs text-[var(--text-muted)]">Optional — not applied to Dares</div></div>
          <button onClick={() => setTimerEnabled(t => !t)} className={`w-12 h-6 rounded-full transition-all relative ${timerEnabled ? 'bg-teal' : 'bg-surface3'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${timerEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div className="text-sm font-semibold">Cards to Win</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCardsToWin(n => Math.max(3, n - 1))} className="w-8 h-8 rounded-lg bg-surface3 text-white font-bold">−</button>
            <span className="font-display font-black text-base w-6 text-center">{cardsToWin}</span>
            <button onClick={() => setCardsToWin(n => Math.min(30, n + 1))} className="w-8 h-8 rounded-lg bg-surface3 text-white font-bold">+</button>
          </div>
        </div>
        <div className="bg-surface2 border border-[var(--border)] rounded-2xl px-4 py-3">
          <div className="text-sm font-semibold mb-2">Single-Task Mode</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSingleTaskDie(null)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${singleTaskDie === null ? 'bg-purple text-white' : 'bg-surface3 text-[var(--text-muted)]'}`}>Off</button>
            {([1,2,3,4,5,6] as DieValue[]).map(d => (
              <button key={d} onClick={() => setSingleTaskDie(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${singleTaskDie === d ? 'text-black' : 'bg-surface3 text-[var(--text-muted)]'}`}
                style={singleTaskDie === d ? { background: DIE_MAP[d].color } : {}}>{DIE_MAP[d].label}</button>
            ))}
          </div>
        </div>
      </div>

      <Button variant="roll" onClick={handleStart} disabled={players.filter(p => p.name.trim()).length < 2} className="mt-auto">START GAME →</Button>
    </div>
  )
}
