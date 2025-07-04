"use client"

import { motion } from "framer-motion"
import { Button } from '@/components/ui-daisy/button'
import { Badge } from '@/components/ui-daisy/badge'
import { Input } from '@/components/ui-daisy/input'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/store'
import { 
  updateCoverLetterTone,
  updateCoverLetterHiringManager
} from '@/lib/features/coverLettersSlice'
import { MessageSquare, User } from "lucide-react"
import { CoverLetterTone } from "@/types/coverLetter"
import { cn } from "@/lib/utils"

interface CoverLetterPersonalizationProps {
  roleId: string
  tone: CoverLetterTone
  hiringManager: string
  jobSource: string
  isMultiRoleMode?: boolean
}

export function CoverLetterPersonalization({
  roleId,
  tone,
  hiringManager,
  jobSource,
  isMultiRoleMode = false
}: CoverLetterPersonalizationProps) {
  const dispatch = useDispatch<AppDispatch>()

  const handleToneChange = (newTone: CoverLetterTone) => {
    dispatch(updateCoverLetterTone({ roleId, tone: newTone }))
  }

  const handleHiringManagerChange = (newHiringManager: string) => {
    dispatch(updateCoverLetterHiringManager({ roleId, hiringManager: newHiringManager }))
  }

  return (
    <div className={cn("space-y-6", isMultiRoleMode ? "pt-4" : "pt-6")}>
      {/* Always Visible Fields */}
      {/* Tone Selection */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Tone & Style
        </label>
        <div className="flex gap-2 flex-wrap">
          {(["formal", "friendly", "enthusiastic"] as const).map((toneOption) => (
            <Button
              key={toneOption}
              variant={tone === toneOption ? "default" : "outline"}
              size="sm"
              onClick={() => handleToneChange(toneOption)}
              className={cn(
                "transition-all duration-200 capitalize",
                tone === toneOption 
                  ? "bg-primary text-primary-content shadow-md" 
                  : "bg-base-100/60 hover:bg-base-100/80 text-base-content border-base-300/50"
              )}
              data-testid={`write-coverletter-button-tone-${toneOption}`}
            >
              {toneOption}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Hiring Manager Input */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label htmlFor="hiringManager" className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Hiring Manager Name
          <Badge variant="secondary" size="sm" className="ml-auto">Optional</Badge>
        </label>
        <div className="relative">
          <Input
            id="hiringManager"
            placeholder="e.g., Sarah Johnson, John Smith"
            value={hiringManager}
            onChange={(e) => handleHiringManagerChange(e.target.value)}
            className="bg-base-100/70 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all pl-10 rounded-lg"
            data-testid="write-coverletter-input-hiring-manager"
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
        </div>
      </motion.div>

    </div>
  )
}