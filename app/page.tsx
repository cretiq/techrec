"use client"

import Link from "next/link"
import { ArrowRight, Code, Users, Zap } from "lucide-react"
import { Button, Badge, FeatureCard, HeroSection, TrustIndicator } from "@/components/ui-daisy"

export default function Home() {
  const trustItems = [
    { icon: "checkCircle" as const, text: "100% Free Platform", iconColor: "text-green-500" },
    { icon: "star" as const, text: "AI-Powered Job Matching", iconColor: "text-yellow-500" },
    { icon: "trendingUp" as const, text: "95% Success Rate", iconColor: "text-blue-500" }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection>
        <div className="max-w-4xl mx-auto text-center">
          {/* New Feature Badge */}
          <Badge 
            variant="gradient" 
            size="xl" 
            rounded="full" 
            pulse 
            className="mb-8"
          >
            New
            <span className="text-violet-600 dark:text-violet-400">AI Cover Letter Generation is live →</span>
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-white">Land Your</span>
            <span className="block gradient-text">Dream Tech Job</span>
            <span className="block text-gray-900 dark:text-white">with AI Power</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            AI-powered platform that helps developers find perfect roles, craft compelling cover letters, and optimize CVs. From job discovery to application success - all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developer/roles/search">
              <Button 
                variant="gradient" 
                size="xl" 
                rounded="full" 
                elevation="float"
              >
                Get Started
              </Button>
            </Link>
            <Link href="#demo">
              <Button 
                variant="outline" 
                size="xl" 
                rounded="full"
                className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Preview Platform
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <TrustIndicator items={trustItems} className="mt-16" />
        </div>
      </HeroSection>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Why Choose TechRec?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're building the future of tech recruitment, one connection at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              glowColor="violet"
              icon={<Code />}
              title="AI-Powered Applications"
              description="Generate personalized cover letters and optimize your CV with advanced AI that understands tech roles."
            />

            <FeatureCard
              glowColor="pink"
              icon={<Users />}
              title="Smart Job Discovery"
              description="Find roles that match your skills perfectly with our intelligent search and recommendation engine."
            />

            <FeatureCard
              glowColor="blue"
              icon={<Zap />}
              title="One-Click Applications"
              description="Apply to multiple roles simultaneously with AI-generated, personalized application materials."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <HeroSection 
        showBlobs={false} 
        minHeight="min-h-0"
        className="py-20 md:py-32"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
            Join thousands of developers and companies who have found their perfect match through TechRec.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developer/roles/search">
              <Button 
                variant="gradient" 
                size="xl" 
                rounded="full" 
                elevation="float"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/company/signup">
              <Button 
                variant="outline" 
                size="xl" 
                rounded="full"
                className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                I'm Hiring
              </Button>
            </Link>
          </div>
        </div>
      </HeroSection>
    </div>
  )
}

