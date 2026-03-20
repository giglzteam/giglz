import { Navbar } from '@/components/marketing/Navbar'
import { HeroSection } from '@/components/marketing/HeroSection'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ChallengeTypes } from '@/components/marketing/ChallengeTypes'
import { ReviewCarousel } from '@/components/marketing/ReviewCarousel'
import { PricingCards } from '@/components/marketing/PricingCards'
import { Footer } from '@/components/marketing/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <ChallengeTypes />
        <ReviewCarousel />
        <PricingCards />
      </main>
      <Footer />
    </>
  )
}
