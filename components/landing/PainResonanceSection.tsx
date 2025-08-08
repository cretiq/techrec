"use client"

import { AlertTriangle, FileX, Clock, Target } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardTitle, Badge } from "@/components/ui-daisy"

const painPoints = [
  {
    number: "92%",
    label: "Applications never reach humans",
    icon: <AlertTriangle className="h-8 w-8" />
  },
  {
    number: "3%",
    label: "Average response rate", 
    icon: <FileX className="h-8 w-8" />
  },
  {
    number: "6",
    label: "Months wasted job searching",
    icon: <Clock className="h-8 w-8" />
  },
  {
    number: "847",
    label: "Developers applied yesterday",
    icon: <Target className="h-8 w-8" />
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

export function PainResonanceSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
          The Reality
        </h2>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-4 gap-8"
      >
        {painPoints.map((point, index) => (
          <Card
            key={index}
            variant="glass"
            hoverable
            animated
            className="text-center p-8"
          >
            <CardContent>
              <div className="flex justify-center mb-4 text-error">
                {point.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-error mb-2">
                {point.number}
              </div>
              <p className="text-base-content/70">
                {point.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}