"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button, Badge, HeroSection, TrustIndicator } from "@/components/ui-daisy"

export function LandingHero() {
  const trustItems = [
    { icon: "checkCircle" as const, text: "No Credit Card Required", iconColor: "text-green-500" },
    { icon: "star" as const, text: "Setup Takes 2 Minutes", iconColor: "text-yellow-500" },
    { icon: "trendingUp" as const, text: "First Matches in 24 Hours", iconColor: "text-blue-500" }
  ]

  return (
    <HeroSection showBlobs={false}>
      <div className="max-w-5xl mx-auto text-center">
        <Badge 
          variant="gradient" 
          size="xl" 
          rounded="full" 
          pulse 
          className="mb-8"
        >
          Limited Early Access
          <span className="text-violet-600">23 spots remaining this week →</span>
        </Badge>

        <h1 className="linear-h1 mb-6">
          <span className="text-base-content">Apply to </span>
          <span className="gradient-text">20+ Tech Jobs</span>
          <span className="block text-base-content">while others apply to 1</span>
        </h1>
        
        <p className="linear-body-lg text-base-content/80 mb-10 max-w-3xl mx-auto">
          Upload once. AI finds perfect matches and generates tailored resumes, cover letters, and outreach messages for every role. Stop the manual grind.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/developer/roles/search">
            <Button 
              variant="gradient" 
              size="xl" 
              rounded="full" 
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="!transition-none !transform-none hover:!scale-100 active:!scale-100"
            >
              Start My Free Job Match Analysis
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button 
              variant="glass-outline" 
              size="xl" 
              rounded="full"
              className="border-2"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        <TrustIndicator items={trustItems} />
      </div>
    </HeroSection>
  )
}