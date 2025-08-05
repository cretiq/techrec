"use client"

import { Card, CardContent } from "@/components/ui-daisy/card"
import { Badge } from "@/components/ui-daisy"
import { Upload, Search, Send, Clock, ArrowRight } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Upload className="h-8 w-8" />,
      title: "Upload & Optimize",
      description: "Upload your CV. AI identifies what recruiters want to see. Get instant suggestions that move you from \"maybe\" to \"must interview.\"",
      time: "2 minutes",
      color: "text-blue-500"
    },
    {
      number: "02", 
      icon: <Search className="h-8 w-8" />,
      title: "Discover Perfect Matches",
      description: "Algorithm scans thousands of roles. Surfaces only opportunities that match your skills and goals. No irrelevant postings.",
      time: "24 hours",
      color: "text-green-500"
    },
    {
      number: "03",
      icon: <Send className="h-8 w-8" />,
      title: "Generate & Apply",
      description: "Select target roles. Generate tailored materials for all simultaneously. Each reads like it was crafted for that specific company.",
      time: "5 minutes",
      color: "text-purple-500"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-base-200/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" size="lg" className="mb-6">
            Three Steps to Transform Your Job Search
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
            How It Works
          </h2>
          
          <p className="text-lg text-base-content/80 mb-8">
            From manual grind to automated success in three simple steps
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-sm-min">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-base-content/70">
                <strong className="text-blue-500">30 minutes</strong> for 20+ applications
              </span>
            </div>
            <div className="hidden sm:block text-base-content/30">vs</div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">
                <strong className="text-red-500">3+ hours</strong> per application (old way)
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card variant="gradient" className="h-full">
                  <CardContent className="p-8 h-full">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <Badge variant="ghost" size="lg" className="text-2xl font-bold">
                        {step.number}
                      </Badge>
                      <div className={`${step.color} bg-current/10 rounded-full p-3`}>
                        <div className={step.color}>
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-4 text-base-content">
                      {step.title}
                    </h3>
                    
                    <p className="text-base-content/70 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Time indicator */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-base-content/50" />
                      <span className="text-sm text-base-content/70">
                        Time: <strong className={step.color}>{step.time}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-base-content/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card variant="gradient">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center text-base-content">
                <div>
                  <div className="text-3xl font-bold mb-2">3,247</div>
                  <div className="text-base-content/80">Developers transformed</div>
                </div>
                <div>  
                  <div className="text-3xl font-bold mb-2">76%</div>
                  <div className="text-base-content/80">Land offers within 45 days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">4.9★</div>
                  <div className="text-base-content/80">Average user rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}