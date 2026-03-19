import { GameCard } from '@/components/game/GameCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 text-center">
      {/* Background glow — z-index:0 so it sits above the section bg but below content via natural stacking */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'var(--teal-glow)',
          filter: 'blur(80px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />

      {/* Content sits above glow via relative + z-index */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">

      {/* Headline */}
      <h1
        className="font-display font-black text-white text-center mb-4"
        style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.1 }}
      >
        Turn Any Party Unforgettable
      </h1>

      {/* Subhead */}
      <p className="text-[var(--text-secondary)] font-medium text-base mb-8 max-w-[480px]">
        No App Store. No Downloads. Click &amp; Play. 200+ cards, 6 challenges.
      </p>

      {/* Card mockup */}
      <div className="w-full max-w-xs mx-auto pointer-events-none mb-8">
        <GameCard cardId={42} />
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/play">
          <Button variant="primary">Play Free →</Button>
        </Link>
        <Button
          variant="secondary"
          className="opacity-40"
          disabled
          title="Coming soon"
          style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
        >
          Get Plus
        </Button>
      </div>
      </div> {/* end relative z-10 content wrapper */}
    </section>
  )
}
