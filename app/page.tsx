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
        <div className="bg-red-500 min-h-screen border-6 border-green-500 font-sans rounded-2xl">
            <h1>Test Page</h1>
            <p>This is a very basic TSX component.</p>
        </div>
      <LandingHero />
      <ProblemSolutionSection />
      <HowItWorksSection />
      {/* <FeaturesBenefitsSection /> */}
      {/* <EnhancedSocialProof /> */}
      <UrgencyScarcitySection />
      <FAQSection />
      <FinalCTASection />
    </div>
  )
}

