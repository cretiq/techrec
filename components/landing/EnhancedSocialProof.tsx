"use client"

import { Card, CardContent } from "@/components/ui-daisy/card"
import { Badge } from "@/components/ui-daisy"
import { Star, Quote, TrendingUp, Users, CheckCircle } from "lucide-react"

export function EnhancedSocialProof() {
  const testimonials = [
    {
      quote: "From 2% to 31% response rate in three weeks",
      fullQuote: "I was getting maybe 1 response per 50 applications using my old approach. Techrec's optimization caught keyword gaps I never would have found. Result: 9 interviews from 29 applications. The AI understands what hiring managers actually look for.",
      name: "Sarah Chen",
      role: "Senior React Developer",
      journey: "Previously at startup → Now at unicorn company",
      avatar: "SC",
      highlight: "31% response rate"
    },
    {
      quote: "Finally, a job search that doesn't consume my weekends",
      fullQuote: "With two kids and a full-time job, I had maybe 3 hours per week for job searching. Techrec let me apply to 18 relevant roles in that time. Got 4 interviews, accepted an offer with 45% salary increase. This tool gave me my life back.",
      name: "Marcus Rodriguez",
      role: "Full-Stack Engineer", 
      journey: "Agency background → Now at Fortune 500",
      avatar: "MR",
      highlight: "45% salary increase"
    },
    {
      quote: "The networking feature was my secret weapon",
      fullQuote: "I'm terrible at self-promotion, but Techrec's AI wrote LinkedIn outreach messages that sounded like confident-me. Connected directly with 6 hiring managers. Got my current role through direct outreach, not job boards.",
      name: "Alex Kim",
      role: "DevOps Engineer",
      journey: "Introverted developer → Landed role through networking",
      avatar: "AK",
      highlight: "6 direct connections"
    }
  ]

  const stats = [
    {
      number: "3,247",
      label: "developers transformed",
      icon: <Users className="h-6 w-6" />
    },
    {
      number: "380%",
      label: "average increase in interviews",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      number: "76%",
      label: "land offers within 45 days",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      number: "4.9★",
      label: "rating from active users",
      icon: <Star className="h-6 w-6" />
    }
  ]

  const companies = [
    "Google", "Microsoft", "Stripe", "Airbnb", "Netflix", "Uber", "Spotify", "Shopify"
  ]

  return (
    <section className="py-20 md:py-32 bg-base-200/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" size="lg" className="mb-6">
            Success Stories from Developers Like You
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
            The Numbers Don't Lie
          </h2>
          
          <p className="text-lg text-base-content/80">
            Real results from real developers who transformed their job search
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div className="group">
              <div className="bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-300/20 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] text-center">
                <div className="text-primary mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-base-content mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-base-content/70">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div className="group h-full">
                <div className="bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-base-300/20 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-full">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  
                  <h3 className="text-xl font-bold text-base-content mb-4">
                    "{testimonial.quote}"
                  </h3>
                  
                  <p className="text-base-content/70 mb-6 leading-relaxed">
                    {testimonial.fullQuote}
                  </p>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base-content">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-base-content/70 mb-2">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {testimonial.journey}
                      </div>
                      <Badge variant="ghost" size="sm" className="mt-2">
                        {testimonial.highlight}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base-content/70 mb-6">
            Used by engineers at:
          </p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {companies.map((company, index) => (
              <div 
                key={index}
                className="px-4 py-2 bg-base-100/60 backdrop-blur-sm rounded-lg border border-base-300/200 text-base-content/80 font-medium"
              >
                {company}
              </div>
            ))}
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium">
              + 500 others
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}