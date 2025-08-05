'use client';

import { Button } from '@/components/ui-daisy/button'
import { Upload, Search, FileText, Send, BarChart3, Rocket, ArrowRight, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function HowToUseAppPage() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Beat the ATS Systems",
      description: "Upload once. AI finds missing keywords that get you past filters.",
      action: "Optimize My CV Now",
      link: "/developer/cv-management",
      color: "from-violet-500 to-purple-500"
    },
    {
      number: "02", 
      icon: Search,
      title: "Get Perfect Matches",
      description: "Stop applying to jobs you'll never get. Find roles you can actually land.",
      action: "See My Matches",
      link: "/developer/saved-roles",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "03",
      icon: FileText,
      title: "Scale Quality Applications",
      description: "Each cover letter reads like you spent hours. Generate 20+ in minutes.",
      action: "Generate Applications",
      link: "/developer/writing-help",
      color: "from-emerald-500 to-teal-500"
    },
    {
      number: "04",
      icon: Send,
      title: "Apply Smarter, Not Harder",
      description: "Send laser-targeted applications that actually get read.",
      action: "Start Applying",
      link: "/developer/saved-roles",
      color: "from-orange-500 to-red-500"
    },
    {
      number: "05",
      icon: BarChart3,
      title: "Track Your Success",
      description: "Watch your interview rate climb. AI learns what works.",
      action: "View Analytics",
      link: "/developer/dashboard",
      color: "from-pink-500 to-violet-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 dark:from-base-300 dark:to-base-200">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
            <Zap className="h-6 w-6 text-violet-500" />
            <span className="text-lg font-semibold text-base-content">How TechRec Works</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Apply to 20+ Jobs
            </span>
            <br />
            <span className="text-base-content">In 30 Minutes 🚀</span>
          </h1>
          
          <p className="text-2xl text-base-content/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop the manual grind. Upload once, get <strong>laser-targeted applications</strong> 
            that actually get read.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-violet-500 via-blue-500 to-emerald-500 rounded-full opacity-20"></div>
          
          {/* Steps */}
          <div className="space-y-20">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isEven = index % 2 === 0
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className={`bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 ${isEven ? 'mr-8' : 'ml-8'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-base-content mb-1">{step.title}</h2>
                          <p className="text-lg text-base-content/70">{step.description}</p>
                        </div>
                      </div>
                      
                      <Link href={step.link}>
                        <Button 
                          variant="gradient-brand" 
                          size="lg" 
                          className="text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {step.action}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl border-4 border-white dark:border-base-100`}>
                      <span className="text-2xl font-black text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1"></div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-24"
        >
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
            <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-4">
              Stop Playing Job Search on Hard Mode 🚀
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Every day you delay, other developers are landing interviews for roles that could be yours.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/developer/cv-management">
                <Button variant="glass" size="lg" className="text-lg px-8 py-4 rounded-xl">
                  <Upload className="h-5 w-5 mr-2" />
                  Get My Free Matches Now
                </Button>
              </Link>
              <Link href="/developer/how-to/job-search">
                <Button variant="glass-outline" size="lg" className="text-lg px-8 py-4 rounded-xl">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Learn the Proven Strategy
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}