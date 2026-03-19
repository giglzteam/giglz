// All available card IDs (PNG filenames without extension)
export const ALL_CARD_IDS: number[] = Array.from(
  { length: 75 },
  (_, i) => i + 26  // 26, 27, ..., 100
)

// Free tier: first 15 cards of the shuffled deck
export const FREE_CARD_LIMIT = 15

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export interface ChallengeType {
  type: string
  label: string
  desc: string
  color: string
  timed: boolean   // false only for Dares
}

// NOTE: desc values are the final UI copy for the ModeStrip, intentionally more
// detailed than brief rulebook descriptions. Die 6 label is 'Dare' (singular).
// These are the authoritative values for the app.
export const DIE_MAP: Record<DieValue, ChallengeType> = {
  1: { type: 'words',        label: 'Words',        desc: 'Explain without saying the word. No parts, no rhymes, no spelling!', color: '#EA6CAE', timed: true  },
  2: { type: 'cliche',       label: 'Cliché',       desc: 'Describe using only its most famous traits — without naming it!',   color: '#7ADDDA', timed: true  },
  3: { type: 'associations', label: 'Associations', desc: 'Give 3 quick associations to lead others to the answer.',            color: '#68519E', timed: true  },
  4: { type: 'gestures',     label: 'Gestures',     desc: 'Act it out — no talking, no sounds!',                               color: '#3097D1', timed: true  },
  5: { type: 'persona',      label: 'Persona',      desc: 'Read the initials aloud. Players guess the real person.',           color: '#7ADDDA', timed: true  },
  6: { type: 'dares',        label: 'Dare',         desc: 'Do what the card says. Group decides if completed.',                color: '#EA6CAE', timed: false },
}

export function cardImagePath(id: number): string {
  return `/cards/${id}.png`
}
