import { Navbar } from '@/components/marketing/Navbar'
import { PricingCards } from '@/components/marketing/PricingCards'
import { Footer } from '@/components/marketing/Footer'
import { getUserPlan } from '@/lib/supabase/getUserPlan'

export const metadata = {
  title: 'Pricing — Giglz',
  description: 'Unlock all 200+ cards and 6 challenge types. From €2.99/month.',
}

export default async function PricingPage() {
  const currentPlan = await getUserPlan()
  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="text-center px-6 mb-4">
          <h1
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Unlock the full game
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 max-w-sm mx-auto">
            Free is genuinely fun. Plus is where the night gets interesting.
          </p>
        </div>
        <PricingCards currentPlan={currentPlan} />
      </main>
      <Footer />
    </>
  )
}
