const REVIEWS = [
  {
    name: 'Aoife M.',
    handle: '@aoife_m',
    text: 'We played this at a house party last week and it completely took over the night. Gestures had us in tears. 10/10 would lose sleep over again.',
    stars: 5,
  },
  {
    name: 'Ciarán D.',
    handle: '@cdolan',
    text: "Bought it at the start of Freshers Week and it's been out every weekend since. The Dare cards are genuinely unhinged in the best way.",
    stars: 5,
  },
  {
    name: 'Jess T.',
    handle: '@jess.t',
    text: 'Played the free version first, upgraded after 20 mins. The Cliché cards especially are so much harder than they look.',
    stars: 5,
  },
  {
    name: 'Rory K.',
    handle: '@rk_plays',
    text: "Works perfectly on phones. No app, no faff, just scan and you're in. Exactly what a party game should be in 2025.",
    stars: 5,
  },
  {
    name: 'Saoirse B.',
    handle: '@saoirseb',
    text: 'Associations sounds easy until you realise your friends have no idea what you mean by "banana republic". Absolute chaos.',
    stars: 5,
  },
  {
    name: 'Liam F.',
    handle: '@liamf_ie',
    text: 'Used it at a team night out. Complete strangers were screaming at each other within 10 minutes. Highly recommend.',
    stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: 'var(--teal)', fontSize: '14px' }}>★</span>
      ))}
    </div>
  )
}

export function ReviewCarousel() {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[var(--text-secondary)] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Reviews
          </p>
          <h2
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Parties remember it for weeks
          </h2>
        </div>

        {/* Review grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'var(--surface1)',
                border: '1px solid var(--border)',
              }}
            >
              <Stars count={r.stars} />

              <p className="text-[var(--text-primary)] text-sm leading-relaxed flex-1">
                &ldquo;{r.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                {/* Avatar placeholder */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-xs shrink-0"
                  style={{
                    background: i % 2 === 0 ? 'var(--teal-glow)' : 'var(--pink-glow)',
                    color: i % 2 === 0 ? 'var(--teal)' : 'var(--pink)',
                    border: `1px solid ${i % 2 === 0 ? 'var(--teal)' : 'var(--pink)'}44`,
                  }}
                >
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{r.name}</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{r.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
