"use client"

import Link from "next/link"
import { ArrowRight, Code, Users, Zap } from "lucide-react"
import { Button, Badge, FeatureCard, HeroSection, TrustIndicator } from "@/components/ui-daisy"

export default function Home() {
  const trustItems = [
    { icon: "checkCircle" as const, text: "Free 14-day trial", iconColor: "text-green-500" },
    { icon: "star" as const, text: "4.9/5 rating from 1000+ users", iconColor: "text-yellow-500" },
    { icon: "trendingUp" as const, text: "10x productivity boost", iconColor: "text-blue-500" }
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
            <span className="text-violet-600 dark:text-violet-400">We've just released a new feature →</span>
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-white">Boost Your</span>
            <span className="block gradient-text">Productivity,</span>
            <span className="block text-gray-900 dark:text-white">Simplify Your Life</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            We're here to simplify the intricacies of your life, providing a user-friendly platform that not only manages your tasks effortlessly but also enhances your overall efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developer/signup">
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
              title="Developer-First"
              description="Built by developers, for developers. We understand what matters most in your job search."
            />

            <FeatureCard
              glowColor="pink"
              icon={<Users />}
              title="Quality Matches"
              description="Connect with companies that value your skills and offer the right opportunities."
            />

            <FeatureCard
              glowColor="blue"
              icon={<Zap />}
              title="Fast & Efficient"
              description="Streamlined application process and quick responses from potential employers."
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
            <Link href="/developer/signup">
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

