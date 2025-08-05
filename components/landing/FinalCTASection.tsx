"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui-daisy/card"
import { Button, Badge } from "@/components/ui-daisy"
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap, 
  Target,
  CreditCard,
  Calendar
} from "lucide-react"

export function FinalCTASection() {
  const processSteps = [
    {
      step: "1",
      title: "Upload your CV",
      time: "2 minutes",
      icon: <Zap className="h-4 w-4" />
    },
    {
      step: "2", 
      title: "Get optimization report",
      time: "instant",
      icon: <Target className="h-4 w-4" />
    },
    {
      step: "3",
      title: "See your first 5 matches",
      time: "24 hours",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      step: "4",
      title: "Generate tailored applications",
      time: "5 minutes",
      icon: <CheckCircle className="h-4 w-4" />
    }
  ]

  const guarantees = [
    "No credit card required",
    "Setup takes 2 minutes", 
    "First matches in 24 hours"
  ]

  return (
    <section className="py-20 md:py-32 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <div className="text-center mb-16">
            <Badge variant="gradient" size="lg" className="mb-6">
              Stop Playing Job Search on Hard Mode
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-base-content">
              Your Transformation Starts<br />
              with a <span className="gradient-text">Single Upload</span>
            </h2>
            
            <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
              Every day you delay is another day watching opportunities go to developers who simply applied faster and smarter.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto">
            {/* Free Plan */}
            <Card variant="glass" hoverable animated className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🆓</div>
                  <div className="text-2xl font-black text-base-content mb-1">$0</div>
                  <div className="text-xs text-base-content/60">per month</div>
                </div>
                
                <h3 className="text-lg font-bold text-base-content mb-2 text-center">
                  Free Plan
                </h3>
                
                <p className="text-sm text-base-content/70 mb-4 text-center">
                  Perfect for trying our service
                </p>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>3 job searches</strong> per month</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>5 results</strong> per search</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Basic job filters</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Save up to <strong>3 jobs</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Mobile app access</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Email support</span>
                  </div>
                </div>
                
                <Link href="/developer/roles/search" className="block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-sm font-semibold py-3 rounded-2xl border hover:bg-base-content hover:text-base-100 transition-all duration-300"
                  >
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card variant="glass" hoverable animated className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🌱</div>
                  <div className="text-2xl font-black text-base-content mb-1">$5</div>
                  <div className="text-xs text-base-content/60">per month</div>
                </div>
                
                <h3 className="text-lg font-bold text-base-content mb-2 text-center">
                  Starter Plan
                </h3>
                
                <p className="text-sm text-base-content/70 mb-4 text-center">
                  For occasional job seekers
                </p>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="text-xs text-base-content/60 font-medium">Everything in Free, plus:</div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>25 searches</strong> per month</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>10 results</strong> per search</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Advanced filters</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Save up to <strong>15 jobs</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Weekly email alerts</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Application tracking</span>
                  </div>
                </div>
                
                <Link href="/developer/roles/search" className="block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-sm font-semibold py-3 rounded-2xl border hover:bg-base-content hover:text-base-100 transition-all duration-300"
                  >
                    Choose Starter
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <div className="relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge variant="gradient-brand" className="px-4 py-1 text-white font-semibold shadow-lg text-xs">
                  Most Popular
                </Badge>
              </div>
              
              <Card variant="gradient" hoverable animated className="h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">💼</div>
                    <div className="text-2xl font-black text-white mb-1">$15</div>
                    <div className="text-xs text-white/70">per month</div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 text-center">
                    Pro Plan
                  </h3>
                  
                  <p className="text-sm text-white/80 mb-4 text-center">
                    Ideal for active job seekers
                  </p>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="text-xs text-white/60 font-medium">Everything in Starter, plus:</div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white"><strong>100 searches</strong> per month</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white"><strong>15 results</strong> per search</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white">Premium filters</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white"><strong>Unlimited</strong> saved jobs</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white">Daily alerts & push notifications</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white">Export to CSV/PDF</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white">Analytics dashboard</span>
                    </div>
                  </div>
                  
                  <Link href="/developer/roles/search" className="block mb-4">
                    <Button 
                      variant="glass" 
                      size="sm" 
                      className="w-full text-sm font-semibold py-3 rounded-2xl text-white border-white/30 hover:bg-white/20 transition-all duration-300"
                    >
                      Choose Pro
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 text-white/80 text-xs bg-white/10 rounded-xl py-2 px-3">
                    <Shield className="h-3 w-3" />
                    <span>60-day guarantee</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ultra Plan */}
            <Card variant="gradient" hoverable animated className="h-full" style={{background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #db2777 100%)'}}>
              <CardContent className="p-6 h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🚀</div>
                  <div className="text-2xl font-black text-white mb-1">$39</div>
                  <div className="text-xs text-white/70">per month</div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 text-center">
                  Ultra Plan
                </h3>
                
                <p className="text-sm text-white/80 mb-4 text-center">
                  Built for recruiters & power users
                </p>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="text-xs text-white/60 font-medium">Everything in Pro, plus:</div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white"><strong>400 searches</strong> per month</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white"><strong>25 results</strong> per search</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white">Bulk operations</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white">API access</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white">Company insights</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white">Team tools (3 users)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <span className="text-white">Dedicated support</span>
                  </div>
                </div>
                
                <Link href="/developer/roles/search" className="block mb-4">
                  <Button 
                    variant="glass" 
                    size="sm" 
                    className="w-full text-sm font-semibold py-3 rounded-2xl text-white border-white/30 hover:bg-white/20 transition-all duration-300"
                  >
                    Choose Ultra
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                
                <div className="flex items-center justify-center gap-2 text-white/80 text-xs bg-white/10 rounded-xl py-2 px-3">
                  <Shield className="h-3 w-3" />
                  <span>Enterprise support</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <div className="mb-8">
              <Link href="/developer/roles/search">
                <Button 
                  variant="gradient" 
                  size="xl" 
                  rounded="full" 
                  elevation="float"
                  rightIcon={<ArrowRight className="h-6 w-6" />}
                  className="text-lg px-12 py-4"
                >
                  Get My Job Matches Now
                </Button>
              </Link>
            </div>
            
            {/* Guarantees */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-base-content/70">
              {guarantees.map((guarantee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{guarantee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}