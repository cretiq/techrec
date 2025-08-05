"use client"

import { Card, CardContent } from "@/components/ui-daisy/card"
import { Badge } from "@/components/ui-daisy"
import { SectionBadge } from "@/components/ui-daisy/section-badge"
import { Clock, TrendingDown, AlertTriangle, Users, Target, Zap } from "lucide-react"

export function UrgencyScarcitySection() {
  const liveStats = [
    {
      number: "47",
      label: "new tech jobs posted",
      sublabel: "in your area (last hour)",
      icon: <Target className="h-5 w-5" />,
      color: "text-blue-500"
    },
    {
      number: "23",
      label: "developers just applied",
      sublabel: "using optimization tools",
      icon: <Users className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      number: "8",
      label: "offers accepted",
      sublabel: "for roles you could have landed",
      icon: <Zap className="h-5 w-5" />,
      color: "text-orange-500"
    }
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <SectionBadge variant="gradient" icon={<AlertTriangle />} className="mb-6">
            The Cost of Waiting
          </SectionBadge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
            What You're Really Competing Against<br />
            Isn't Other Developers—<span className="gradient-text">It's Time Itself</span>
          </h2>
        </div>

        {/* Live Stats */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card variant="gradient">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-base-content">
                  Right now, while you're reading this:
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {liveStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`${stat.color} mb-3 flex justify-center`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-base-content mb-2">
                      {stat.number}
                    </div>
                    <div className="font-medium text-base-content mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {stat.sublabel}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competition Reality */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <Card variant="gradient" className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-8 w-8 text-red-500 flex-shrink-0" />
                  <h3 className="text-xl font-bold text-base-content">
                    The 48-Hour Window
                  </h3>
                </div>
                <div className="flex-1">
                  <p className="text-base-content/70 mb-4">
                    The average tech job receives <strong className="text-base-content">250 applications</strong> in the first 48 hours.
                  </p>
                  <p className="text-base-content/70">
                    After that, your chances drop by <strong className="text-red-500">73%</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="h-8 w-8 text-orange-500 flex-shrink-0" />
                  <h3 className="text-xl font-bold text-base-content">
                    Traditional Job Searching
                  </h3>
                </div>
                <div className="flex-1">
                  <p className="text-base-content/70 mb-4">
                    Puts you at the <strong className="text-red-500">back of that line</strong>.
                  </p>
                  <p className="text-base-content/70">
                    Techrec puts you at the <strong className="text-green-500">front</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scarcity Element */}
        <div className="max-w-3xl mx-auto">
          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-8 text-center text-base-content/80 relative z-10">
              <SectionBadge variant="glass" className="mb-6 text-base-content/70 border-base-content/20">
                Limited Early Access
              </SectionBadge>
              
              <h3 className="text-2xl font-bold mb-4">
                Only 100 New Users Per Week
              </h3>
              
              <p className="text-base-content/90 mb-6">
                We're currently accepting limited new users to ensure quality service and personalized support for every developer.
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-base-content/70">23</div>
                  <div className="text-sm text-base-content/60">spots remaining</div>
                </div>
                <div className="text-base-content/40">|</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-base-content/70">6</div>
                  <div className="text-sm text-base-content/60">days left</div>
                </div>
              </div>

              <div className="bg-base-content/20 rounded-full h-2 mb-4">
                <div className="bg-base-content rounded-full h-2 w-3/4 transition-all duration-300"></div>
              </div>
              
              <p className="text-sm text-base-content/80">
                77% of this week's spots already claimed
              </p>
            </CardContent>
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}