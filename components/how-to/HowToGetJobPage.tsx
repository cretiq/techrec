'use client';

import { Button } from '@/components/ui-daisy/button'
import { 
  Target, 
  FileText, 
  MessageSquare, 
  Search, 
  TrendingUp, 
  ArrowRight,
  Code,
  Briefcase,
  Crown,
  Lightbulb,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function HowToGetJobPage() {
  const guides = [
    {
      number: "1",
      icon: Target,
      title: "Stop Playing on Hard Mode",
      subtitle: "The problem isn't your skills—it's your approach",
      points: [
        "Your qualified resume gets filtered out by ATS 🚫",
        "You're competing on volume, not relevance 📉",
        "Others land interviews while you're still writing 😤"
      ],
      color: "from-emerald-500 to-teal-500",
      time: "Reality Check"
    },
    {
      number: "2", 
      icon: FileText,
      title: "Beat ATS Systems Every Time",
      subtitle: "Make bots and humans love your CV",
      points: [
        "AI finds missing keywords you never knew existed 🔍",
        "Move from filtered out to shortlisted 📈",
        "Pass the bots, land on human desks ✨"
      ],
      color: "from-blue-500 to-cyan-500",
      time: "Game Changer"
    },
    {
      number: "3",
      icon: MessageSquare,
      title: "Scale Quality, Not Just Quantity",
      subtitle: "Each application reads like you spent hours",
      points: [
        "Generate 20+ tailored cover letters in minutes 🪝",
        "Laser-targeted to each specific role ✅",
        "Sound confident and authentic every time 🏢"
      ],
      color: "from-violet-500 to-purple-500",
      time: "Force Multiplier"
    },
    {
      number: "4",
      icon: Search,
      title: "Apply to Jobs You Can Actually Land",
      subtitle: "Stop wasting time on senior roles when you're mid-level",
      points: [
        "Smart matching finds perfect-fit opportunities 📊",
        "Compete on relevance, not desperation 🌐",
        "Focus energy where it actually converts 🤝"
      ],
      color: "from-orange-500 to-red-500",
      time: "Smart Strategy"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-base-300 dark:to-base-200">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
            <Code className="h-6 w-6 text-emerald-500" />
            <span className="text-lg font-semibold text-base-content">Career Strategy</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Stop Losing to Developers
            </span>
            <br />
            <span className="text-base-content">Who Apply Smarter 💼</span>
          </h1>
          
          <p className="text-2xl text-base-content/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            The <strong>brutal truth:</strong> You spend 3+ hours per application. 
            Others land interviews while you're still writing cover letters.
          </p>
        </motion.div>

        {/* Main Guide Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {guides.map((guide, index) => {
            const IconComponent = guide.icon
            return (
              <motion.div
                key={guide.number}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="group"
              >
                <div className="bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                  
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-black text-base-content">Step {guide.number}</span>
                        <span className="text-sm bg-base-200/50 px-3 py-1 rounded-full text-base-content/60">
                          {guide.time}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-base-content mb-1">{guide.title}</h3>
                      <p className="text-lg text-base-content/70">{guide.subtitle}</p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="space-y-3 mb-6">
                    {guide.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${guide.color}`}></div>
                        <span className="text-lg text-base-content/80">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Wins */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/90 dark:bg-base-100/90 backdrop-blur-sm rounded-3xl p-12 mb-20 shadow-xl border border-white/20"
        >
          <div className="text-center mb-8">
            <Zap className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-base-content mb-2">⚡ While You're Still Using the Old Way...</h2>
            <p className="text-lg text-base-content/70">Traditional job searching puts you at the back of the line</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📝", title: "3+ Hours", desc: "Per application you craft" },
              { icon: "🔍", title: "ATS Filters", desc: "Block your qualified resume" },
              { icon: "📊", title: "Copy-Paste", desc: "Same resume for every role" },
              { icon: "💬", title: "Back of Line", desc: "While others use AI advantage" }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">{item.title}</h3>
                <p className="text-sm text-red-600 dark:text-red-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
            <Briefcase className="h-16 w-16 text-white mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-4">
              Your Transformation Starts With One Upload 🚀
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              While others copy-paste the same resume, you'll send laser-targeted applications that actually get read.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/developer/cv-management">
                <Button variant="glass" size="lg" className="text-lg px-8 py-4 rounded-xl">
                  <FileText className="h-5 w-5 mr-2" />
                  Get My Free Job Matches Now
                </Button>
              </Link>
              <Link href="/developer/saved-roles">
                <Button variant="glass-outline" size="lg" className="text-lg px-8 py-4 rounded-xl">
                  <Search className="h-5 w-5 mr-2" />
                  See Perfect Matches
                </Button>
              </Link>
              <Link href="/developer/how-to/app">
                <Button variant="glass-outline" size="lg" className="text-lg px-8 py-4 rounded-xl">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  How TechRec Works
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}