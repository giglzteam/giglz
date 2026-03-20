const STEPS = [
  {
    num: '01',
    icon: '👥',
    title: 'Gather Your Crew',
    desc: 'Add 2–12 players. No accounts, no downloads — just open the link.',
    color: 'var(--teal)',
    glow: 'var(--teal-glow)',
  },
  {
    num: '02',
    icon: '🎲',
    title: 'Roll the Die',
    desc: 'Each face maps to a challenge type. What you roll is what you get.',
    color: 'var(--pink)',
    glow: 'var(--pink-glow)',
  },
  {
    num: '03',
    icon: '🃏',
    title: 'Face the Challenge',
    desc: '6 types: Words, Cliché, Associations, Gestures, Persona, Dares. 60 seconds on the clock.',
    color: 'var(--purple)',
    glow: 'var(--purple-glow)',
  },
  {
    num: '04',
    icon: '🏆',
    title: 'Win the Night',
    desc: 'First player to collect 10 cards wins. Then immediately demands a rematch.',
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[var(--text-secondary)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            How it works
          </p>
          <h2
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Ready in under 2 minutes
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'var(--surface1)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Connector line — desktop only */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-10 -right-3 w-6 h-[2px]"
                  style={{ background: 'var(--border-hover)', zIndex: 1 }}
                />
              )}

              {/* Number badge */}
              <span
                className="font-display font-black text-xs tracking-widest px-2 py-1 rounded-full w-fit"
                style={{
                  color: step.color,
                  background: step.glow,
                  border: `1px solid ${step.color}33`,
                }}
              >
                {step.num}
              </span>

              {/* Icon */}
              <div className="text-4xl leading-none">{step.icon}</div>

              {/* Text */}
              <div>
                <h3
                  className="font-display font-black text-white mb-2"
                  style={{ fontSize: '1rem' }}
                >
                  {step.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
