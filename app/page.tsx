"use client"

import { LandingHero } from "@/components/landing/LandingHero"
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesBenefitsSection } from "@/components/landing/FeaturesBenefitsSection"
import { EnhancedSocialProof } from "@/components/landing/EnhancedSocialProof"
import { UrgencyScarcitySection } from "@/components/landing/UrgencyScarcitySection"
import { FAQSection } from "@/components/landing/FAQSection"
import { FinalCTASection } from "@/components/landing/FinalCTASection"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHero />
      <ProblemSolutionSection />
      <HowItWorksSection />
      {/* <FeaturesBenefitsSection /> */}
      {/* <EnhancedSocialProof /> */}
      <UrgencyScarcitySection />
      <FinalCTASection />
      <FAQSection />
    </div>
  )
}

