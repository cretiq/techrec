"use client"

import { CheckCircle, Target, Zap, Award } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui-daisy"

const solutions = [
  {
    number: "94%",
    label: "ATS pass rate",
    icon: <CheckCircle className="h-8 w-8" />
  },
  {
    number: "38%",
    label: "Response rate", 
    icon: <Target className="h-8 w-8" />
  },
  {
    number: "20x",
    label: "Faster applications",
    icon: <Zap className="h-8 w-8" />
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
}

const numberVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.6, delay: 0.2 }
  }
}

export function SolutionRevealSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
          The Solution
        </h2>
        <p className="text-lg text-base-content/70">
          Get 3x more interviews in half the time
        </p>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8"
      >
        {solutions.map((solution, index) => (
          <Card
            key={index}
            variant="glass"
            hoverable
            animated
            className="text-center p-8"
          >
            <CardContent>
              <div className="flex justify-center mb-4 text-success">
                {solution.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                {solution.number}
              </div>
              <p className="text-base-content/70">
                {solution.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}