"use client"

import { Card, CardContent } from "@/components/ui-daisy/card"
import { Badge } from "@/components/ui-daisy"
import { Clock, Heart, Zap, TrendingUp, Target, CheckCircle } from "lucide-react"

export function ProblemSolutionSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 mx-auto space-y-20">
        {/* The Developer's Hidden Struggle */}
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" size="lg" className="mb-6">
            The Developer's Hidden Struggle
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-base-content">
            Every Generic Application Makes You Feel Like<br />
            <span className="gradient-text">Just Another Resume in the Pile</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card variant="gradient">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-base-content">The External Problem</h3>
                <p className="text-base-content/70">
                  Job searching is time-consuming and soul-crushing. Weekends spent tweaking cover letters instead of building.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="gradient">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-base-content">The Internal Problem</h3>
                <p className="text-base-content/70">
                  You solve problems elegantly—yet you're stuck in the most inefficient process imaginable.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="gradient">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-base-content">What's at Stake</h3>
                <p className="text-base-content/70">
                  While you're perfecting applications, other developers are landing better roles faster.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Guide to a Better Way */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gradient" size="lg" className="mb-6">
              Your Guide to a Better Way
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
              We Believe There's an<br />
              <span className="gradient-text">Elegant Solution</span> to Every Problem
            </h2>
            
            <p className="text-xl text-base-content/80 mb-8">
              Techrec doesn't just automate applications—it intelligently optimizes them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Target className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-2">Compete on Relevance, Not Volume</h3>
                  <p className="text-base-content/70">
                    Send targeted materials that actually get read instead of generic applications that get filtered out.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <TrendingUp className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-2">Know Your CV is Optimized</h3>
                  <p className="text-base-content/70">
                    AI analyzes against successful profiles in your field, ensuring higher ATS pass rates.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-2">From Overlooked to Interviewed</h3>
                  <p className="text-base-content/70">
                    Transform from another applicant in the pile to a candidate that stands out and gets noticed.
                  </p>
                </div>
              </div>
            </div>
            
            <Card variant="gradient">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-base-content mb-2">380%</div>
                <div className="text-base-content/90 mb-4">Average increase in interview requests</div>
                <div className="text-lg text-base-content/80">
                  "Finally, a job search that doesn't consume my weekends"
                </div>
                <div className="text-sm text-base-content/70 mt-2">
                  — Marcus Rodriguez, Full-Stack Engineer
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}