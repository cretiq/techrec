"use client"

import { Star, TrendingUp, Users, Award, Quote } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui-daisy"

const socialStats = [
  {
    number: "12,847+",
    label: "Developers using TechRec",
    icon: <Users className="h-8 w-8" />
  },
  {
    number: "2,847",
    label: "Hired in 90 days",
    icon: <TrendingUp className="h-8 w-8" />
  },
  {
    number: "347",
    label: "Joined yesterday",
    icon: <Award className="h-8 w-8" />
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const StatCard = ({ icon, number, description }: { icon: React.ReactNode, number: string, description: string }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
      {number}
    </div>
    <p className="text-gray-600 font-medium">
      {description}
    </p>
  </motion.div>
)

export function SocialProofMatrix() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
          Join Thousands Already Hired
        </h2>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8"
      >
        {socialStats.map((stat, index) => (
          <Card
            key={index}
            variant="glass"
            hoverable
            animated
            className="text-center p-8"
          >
            <CardContent>
              <div className="flex justify-center mb-4 text-primary">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <p className="text-base-content/70">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}