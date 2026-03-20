const CHALLENGES = [
  {
    die: 1,
    label: 'Words',
    desc: 'Explain the word without saying it. No parts, no rhymes, no spelling.',
    color: '#EA6CAE',
    glow: 'rgba(234,108,174,0.25)',
    emoji: '💬',
  },
  {
    die: 2,
    label: 'Cliché',
    desc: 'Describe a famous person or place using only their most iconic traits.',
    color: '#7ADDDA',
    glow: 'rgba(122,221,218,0.2)',
    emoji: '✨',
  },
  {
    die: 3,
    label: 'Associations',
    desc: 'Give 3 quick word associations to lead the group to the answer.',
    color: '#9B8EC4',
    glow: 'rgba(104,81,158,0.35)',
    emoji: '🔗',
  },
  {
    die: 4,
    label: 'Gestures',
    desc: 'Act it out silently. No talking. No sounds. Pure mime.',
    color: '#3097D1',
    glow: 'rgba(48,151,209,0.25)',
    emoji: '🙌',
  },
  {
    die: 5,
    label: 'Persona',
    desc: 'Read the initials out loud. Players guess the real celebrity or figure.',
    color: '#7ADDDA',
    glow: 'rgba(122,221,218,0.2)',
    emoji: '🎭',
  },
  {
    die: 6,
    label: 'Dare',
    desc: 'Do what the card says. The group decides if you actually pulled it off.',
    color: '#EA6CAE',
    glow: 'rgba(234,108,174,0.25)',
    emoji: '🔥',
  },
]

export function ChallengeTypes() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface1)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[var(--text-secondary)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            6 challenge types
          </p>
          <h2
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            One die. Six ways to play.
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto">
            Every roll is a different flavour. No two turns feel the same.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHALLENGES.map(ch => (
            <div
              key={ch.die}
              className="rounded-2xl p-6 flex gap-4 items-start transition-transform duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--surface2)',
                border: `1px solid ${ch.color}33`,
                boxShadow: `0 0 0 0 ${ch.glow}`,
              }}
            >
              {/* Die badge */}
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-sm"
                style={{
                  background: ch.glow,
                  border: `1px solid ${ch.color}55`,
                  color: ch.color,
                }}
              >
                {ch.die}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none">{ch.emoji}</span>
                  <h3
                    className="font-display font-black text-sm"
                    style={{ color: ch.color }}
                  >
                    {ch.label}
                  </h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {ch.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
