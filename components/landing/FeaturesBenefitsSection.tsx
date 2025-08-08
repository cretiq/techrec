"use client"

import { Card, CardContent } from "@/components/ui-daisy/card"
import { Badge } from "@/components/ui-daisy"
import { 
  FileSearch, 
  Target, 
  Zap, 
  TrendingUp, 
  PenTool,
  CheckCircle,
  X,
  ArrowRight
} from "lucide-react"

export function FeaturesBenefitsSection() {
  const features = [
    {
      icon: <FileSearch className="h-8 w-8" />,
      title: "Intelligent CV Optimization",
      whatItDoes: "AI analyzes your CV against successful profiles in your field",
      whatYouGet: "Higher ATS pass rates and recruiter attention",
      whatYouAvoid: "The frustration of qualified applications being filtered out",
      glowColor: "violet"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Skills-Based Job Matching",
      whatItDoes: "Finds roles that actually match your technical stack and experience level",
      whatYouGet: "Applications to jobs you can realistically land and genuinely want",
      whatYouAvoid: "Wasting time on dead-end applications",
      glowColor: "blue"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Bulk Tailored Applications",
      whatItDoes: "Creates unique, compelling materials for multiple roles simultaneously",
      whatYouGet: "The efficiency of automation with the effectiveness of customization",
      whatYouAvoid: "The choice between quality and quantity",
      glowColor: "green"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Continuous Improvement Engine",
      whatItDoes: "Learns from your application patterns and success rates",
      whatYouGet: "Smarter recommendations with every use",
      whatYouAvoid: "Repeating strategies that don't work",
      glowColor: "orange"
    },
    {
      icon: <PenTool className="h-8 w-8" />,
      title: "Complete Application Packages",
      whatItDoes: "Generates optimized resumes, persuasive cover letters, and professional outreach messages",
      whatYouGet: "Everything you need to make a strong first impression",
      whatYouAvoid: "Cobbling together mismatched application materials",
      glowColor: "pink"
    }
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" size="lg" className="mb-6">
            Key Features & Benefits
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
            Why Choose <span className="gradient-text">TechRec</span>?
          </h2>
          
          <p className="text-lg text-base-content/80">
            Built for developers who understand the difference between working hard and working smart.
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {features.map((feature, index) => (
            <div className="group">
              <div className="bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-2xl shadow-lg border border-base-300/20 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] overflow-hidden">
                <div className="grid lg:grid-cols-2 items-center">
                  {/* Icon and Title Side */}
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`bg-gradient-to-br from-${feature.glowColor}-500 to-${feature.glowColor}-600 rounded-xl p-3 text-white shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-base-content">
                        {feature.title}
                      </h3>
                    </div>
                    
                    <p className="text-lg text-base-content/80 leading-relaxed">
                      {feature.whatItDoes}
                    </p>
                  </div>

                  {/* Benefits Side */}
                  <div className="bg-base-100/40 p-8 lg:p-12 space-y-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-base-content mb-1">What you get:</h4>
                        <p className="text-base-content/70">{feature.whatYouGet}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-base-content mb-1">What you avoid:</h4>
                        <p className="text-base-content/70">{feature.whatYouAvoid}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="group">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-violet-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Work Smarter, Not Harder?
                </h3>
                <p className="text-white/90 mb-6">
                  Join 3,247 developers who've already transformed their job search with intelligent automation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn btn-primary btn-lg">
                    Start My Free Analysis
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button className="btn btn-ghost btn-lg text-white border-white/30 hover:bg-white/10">
                    See Success Stories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}