"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from '@/components/ui-daisy/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { Textarea } from "@/components/ui-daisy/textarea"
// Removed legacy Label import to use daisyUI native labels
import { Input } from '@/components/ui-daisy/input'
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/store'
import { 
  setCoverLetter, 
  selectCoverLetter, 
  updateCoverLetterAttractionPoints,
  updateCoverLetterJobSource
} from '@/lib/features/coverLettersSlice'
import { PlusCircle, Trash2, ArrowRight, Download, RefreshCw, Loader2, Copy, Check, Sparkles, Award, Target, FileText, CheckCircle2, ChevronRight, ChevronDown, Briefcase, X } from "lucide-react"
import { ApplicationActionButton } from "@/components/roles/ApplicationActionButton"
import { ApplicationBadge } from "@/components/roles/ApplicationBadge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InternalProfile, InternalAchievement } from "@/types/types"
import { Role } from "@/types/role"
import { CoverLetterTone } from "@/types/coverLetter"
import { CoverLetterPersonalization } from "./cover-letter-personalization"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Animation variants following AnalysisSummaryDashboard pattern
const scaleOnHover = { scale: 1.02 };
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

interface CoverLetterCreatorProps {
  role: Role
  generationTrigger?: number
  onGenerationComplete?: (roleId: string, success: boolean) => void
  onGenerationStart?: (roleId: string) => void
  isExternallyLocked?: boolean
  isMultiRoleMode?: boolean
  onRemoveRole?: () => void
  onRemoveHover?: (isHovered: boolean) => void
}

export function CoverLetterCreator({ 
  role, 
  generationTrigger, 
  onGenerationComplete, 
  onGenerationStart,
  isExternallyLocked,
  isMultiRoleMode = false, 
  onRemoveRole, 
  onRemoveHover 
}: CoverLetterCreatorProps) {
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const [isRemoveHovered, setIsRemoveHovered] = useState(false)
  
  // Get cover letter from Redux (if it exists)
  const existingCoverLetter = useSelector((state: RootState) => selectCoverLetter(state, role.id))
  
  const [developerProfile, setDeveloperProfile] = useState<InternalProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newAchievementTitle, setNewAchievementTitle] = useState<string>("")
  const [newAttractionPoint, setNewAttractionPoint] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [isPersonalizationExpanded, setIsPersonalizationExpanded] = useState(!isMultiRoleMode)
  const [lastTriggeredValue, setLastTriggeredValue] = useState<number>(0)
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false)
  
  // Use Redux state or default values
  const generatedLetter = existingCoverLetter?.letter || ""
  const jobSource = existingCoverLetter?.jobSource || ""
  const companyAttractionPoints = existingCoverLetter?.companyAttractionPoints || [
    "Innovative products in the tech space",
    "Strong company culture and values"
  ]
  const tone = existingCoverLetter?.tone || "formal"
  const requestType = "coverLetter" // Fixed for cover letter tab
  const hiringManager = existingCoverLetter?.hiringManager || ""
  
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developer/me/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data: InternalProfile = await response.json()
        setDeveloperProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({ title: "Error Loading Profile", description: "Could not load your profile data.", variant: "destructive" });
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session, toast])

  useEffect(() => {
    // Only trigger generation for "Generate All" if:
    // 1. We have a valid trigger value
    // 2. This trigger value hasn't been processed yet
    // 3. We have the developer profile
    // 4. We're not currently generating
    // 5. No cover letter exists yet (skip roles with existing content)
    if (
      generationTrigger && 
      generationTrigger > 0 && 
      generationTrigger !== lastTriggeredValue &&
      developerProfile && 
      !isGenerating &&
      !generatedLetter // Only generate for "Generate All" if no cover letter exists yet
    ) {
      console.log(`[CoverLetterCreator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. No existing letter found. Triggering generation.`);
      
      // Mark this trigger value as processed
      setLastTriggeredValue(generationTrigger)
      handleGenerate();
    } else if (generationTrigger && generationTrigger > 0 && generationTrigger !== lastTriggeredValue && generatedLetter) {
      console.log(`[CoverLetterCreator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. Cover letter already exists. Skipping generation.`);
      // Mark this trigger as processed even though we skipped generation
      setLastTriggeredValue(generationTrigger)
      // Report completion immediately since we're skipping
      onGenerationComplete?.(role.id, true)
    } else if (generationTrigger && generationTrigger > 0 && !developerProfile) {
      console.log(`[CoverLetterCreator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. Profile NOT loaded yet. Generation deferred.`);
    }
  }, [generationTrigger, lastTriggeredValue, developerProfile, isGenerating, generatedLetter, role.id]);

  const handleAddAchievement = () => {
    if (newAchievementTitle.trim() === '') return
    if (developerProfile) {
      const newAch: InternalAchievement = {
        id: `temp_ach_${Date.now()}`,
        title: newAchievementTitle,
        description: '',
        date: new Date().toISOString(),
        url: null,
        issuer: null
      };
      setDeveloperProfile({
        ...developerProfile,
        achievements: [...developerProfile.achievements, newAch]
      })
      setNewAchievementTitle('')
    }
  }

  const handleRemoveAchievement = (idToRemove: string) => {
    if (developerProfile) {
      setDeveloperProfile({
        ...developerProfile,
        achievements: developerProfile.achievements.filter((ach: InternalAchievement) => ach.id !== idToRemove)
      })
    }
  }

  const handleAddAttractionPoint = () => {
    if (newAttractionPoint.trim() === '') return
    const updatedPoints = [...companyAttractionPoints, newAttractionPoint]
    dispatch(updateCoverLetterAttractionPoints({ roleId: role.id, attractionPoints: updatedPoints }))
    setNewAttractionPoint('')
  }

  const handleRemoveAttractionPoint = (index: number) => {
    const updatedPoints = [...companyAttractionPoints]
    updatedPoints.splice(index, 1)
    dispatch(updateCoverLetterAttractionPoints({ roleId: role.id, attractionPoints: updatedPoints }))
  }

  // Personalization handlers moved to CoverLetterPersonalization component

  const handleRegenerate = () => {
    // Reset trigger tracking to allow manual regeneration
    setLastTriggeredValue(0)
    handleGenerate()
  }

  const handleGenerate = async () => {
    if (!developerProfile) {
      toast({
        title: "Error",
        description: "Profile data not loaded yet. Please wait.",
        variant: "destructive",
      })
      onGenerationComplete?.(role.id, false);
      return
    }

    onGenerationStart?.(role.id);
    setIsGenerating(true)
    let success = false
    try {
      const requestData = {
        developerProfile: developerProfile,
        roleInfo: {
          title: role.title,
          description: role.description,
          requirements: role.requirements,
          skills: role.skills.map(skill => typeof skill === 'string' ? skill : skill.name),
        },
        companyInfo: {
          name: role.company.name,
          location: role.location,
          remote: role.remote,
          attractionPoints: companyAttractionPoints
        },
        jobSourceInfo: {
          source: jobSource || undefined
        },
        tone,
        requestType,
        hiringManager: hiringManager || undefined,
        regenerationCount: generationTrigger,
      }

      console.log("Sending request data:", JSON.stringify(requestData, null, 2))

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Generation API Error:", errorData);
        throw new Error(errorData.error || "Failed to generate cover letter");
      }

      const data = await response.json()
      
      // Save to Redux
      dispatch(setCoverLetter({
        roleId: role.id,
        letter: data.letter,
        generatedAt: new Date().toISOString(),
        jobSource: jobSource || undefined,
        companyAttractionPoints,
        tone,
        requestType,
        hiringManager: hiringManager || undefined,
        provider: data.provider,
        cached: data.cached,
        fallback: data.fallback
      }))
      
      // Trigger fade-in animation
      setIsNewlyGenerated(true)
      setTimeout(() => setIsNewlyGenerated(false), 1500) // Reset after animation completes
      
      toast({ title: "Success!", description: `Cover letter for "${role.title}" generated.` });
      success = true;
    } catch (error) {
      console.error("Generate Cover Letter Error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      onGenerationComplete?.(role.id, success)
      
      // If generation failed, reset the last triggered value so it can be retried
      if (!success && isMultiRoleMode) {
        setLastTriggeredValue(0)
      }
    }
  }

  const handleExport = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cover-letter.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // --- Copy Handler ---
  const handleCopy = () => {
    if (!generatedLetter) {
      toast({ title: "Nothing to Copy", description: "Generate a letter first.", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(generatedLetter)
      .then(() => {
        toast({ title: "Copied!", description: "Cover letter copied to clipboard." });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
      });
  }

  // Add a progress animation value for the loading state
  const [progressValue, setProgressValue] = useState(0)
  
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 90) return 90
          return prev + Math.random() * 15
        })
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setProgressValue(0)
    }
  }, [isGenerating])

  return (
    <div 
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto",
        isMultiRoleMode ? "gap-4" : "gap-6",
        "lg:items-start lg:h-auto"
      )}
    >
      {/* Left Column - Customization */}
      <div 
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        {/* Header Card */}
        <Card 
          variant="transparent"
          data-testid="write-coverletter-card-header"
        >
            <CardHeader className={cn(isMultiRoleMode ? "pb-4 pt-4" : "pb-6 pt-6")}>
            <div className="space-y-4">
              {/* Top Row - Title/Description with Remove Button */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <motion.div 
                    animate={{ rotate: isGenerating ? 360 : 0 }}
                    transition={{ 
                      duration: isGenerating ? 2 : 0.5, 
                      repeat: isGenerating ? Infinity : 0, 
                      ease: "linear" 
                    }}
                    className="p-3 bg-primary/10 backdrop-blur-md rounded-lg border border-primary/20 flex-shrink-0"
                  >
                    <Sparkles className={cn("text-primary", isMultiRoleMode ? "h-6 w-6" : "h-8 w-8")} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                                      <CardTitle className={cn("font-bold mb-2 text-base-content", isMultiRoleMode ? "text-2xl" : "text-3xl")}>
                    <span className="truncate" title={role.title}>
                      {role.title}
                    </span>
                  </CardTitle>
                    <CardDescription className="text-base-content/70 flex items-center gap-2 flex-wrap">
                      <span>at</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        {role.company.name}
                      </Badge>
                      {role.location && (
                        <span className="text-base-content/60 text-sm">• {role.location}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Remove Button - Only show in multi-role mode - Top Right */}
                {isMultiRoleMode && onRemoveRole && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRemoveRole}
                      onMouseEnter={() => {
                        setIsRemoveHovered(true)
                        onRemoveHover?.(true)
                      }}
                      onMouseLeave={() => {
                        setIsRemoveHovered(false)
                        onRemoveHover?.(false)
                      }}
                      className="h-8 w-8 text-base-content/50 hover:text-error hover:bg-error/10 transition-all duration-200"
                      aria-label="Remove role"
                      title="Remove role"
                      data-testid={`write-multirole-remove-button-${role.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>

                          {/* Bottom Row - Generate Button */}
            <div className="w-full">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="w-full"
              >
                <Button
                  onClick={generatedLetter ? handleRegenerate : handleGenerate}
                  disabled={isGenerating || isExternallyLocked || !developerProfile}
                  variant="linkedin"
                  size="lg"
                  elevation="lg"
                  loading={isGenerating}
                  className="w-full text-base group"
                  data-testid="write-coverletter-button-generate-trigger"
                  leftIcon={!isGenerating ? <Sparkles className="h-5 w-5 flex-shrink-0 group-hover:animate-pulse" /> : undefined}
                  rightIcon={!isGenerating ? <ArrowRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" /> : undefined}
                >
                  <span className="font-medium text-lg">
                    {isGenerating 
                      ? 'Generating Cover Letter...'
                      : generatedLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'
                    }
                  </span>
                </Button>
              </motion.div>
            </div>
            </div>
            
            {!developerProfile && (
              <p className="text-xs text-base-content/60 mt-2">
                Loading your profile data...
              </p>
            )}
            </CardHeader>
        </Card>

        {/* Customization Card */}
        <motion.div variants={fadeInUp}>
          <Card 
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 rounded-lg"
            data-testid="write-coverletter-card-customization"
          >
            <CardHeader className="bg-base-100/30 backdrop-blur-sm transition-all duration-300">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-base-content">Personalize Your Application</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Always Visible: Tone & Style and Hiring Manager Name */}
              <CoverLetterPersonalization
                roleId={role.id}
                tone={tone}
                hiringManager={hiringManager}
                jobSource={jobSource}
                isMultiRoleMode={isMultiRoleMode}
              />
              
              {/* TODO: Additional Customization section temporarily hidden for UI simplicity
                  This includes the collapsible button and all advanced customization options:
                  - Job Source input
                  - Key Achievements section
                  - Company Attraction Points section
                  Will be restored when we want to offer more detailed personalization options */}
              {/* <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPersonalizationExpanded(!isPersonalizationExpanded)}
                  className="w-full justify-between p-3 h-auto hover:bg-base-200/50 transition-all duration-200 rounded-lg m-0"
                  data-testid="write-coverletter-header-personalization-trigger"
                >
                  <span className="text-sm font-medium text-base-content">
                    Additional Customization
                  </span>
                  <motion.div
                    animate={{ rotate: isPersonalizationExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-base-content/60" />
                  </motion.div>
                </Button>
                
                <AnimatePresence>
                  {isPersonalizationExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-6">
                        [Job Source Input, Achievements Section, Company Attraction Points sections were here]
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div> */}
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="p-5 bg-primary/10 backdrop-blur-sm rounded-lg border border-primary/30 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 h-8 w-8 animate-ping opacity-30">
                    <Loader2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-base-content">AI is crafting your perfect cover letter...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzing your profile and matching it to {role.company.name}'s requirements
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>Usually takes 10-15 seconds</span>
                </div>
                <div className="relative">
                  <Progress value={progressValue} className="h-2" />
                  <div className="absolute inset-0 h-2 bg-gradient-to-r from-primary to-secondary opacity-20 blur-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column - Generated Letter */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
        className="h-full"
      >
        <motion.div
          animate={isNewlyGenerated ? {
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0)",
              "0 0 20px 4px rgba(34, 197, 94, 0.5)",
              "0 0 40px 8px rgba(34, 197, 94, 0.3)",
              "0 0 0 0 rgba(34, 197, 94, 0)"
            ]
          } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-lg h-full"
        >
          <Card 
            className={cn(
              "bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 h-full relative overflow-hidden rounded-lg shadow-lg",
              isNewlyGenerated && "ring-2 ring-success/50 bg-success/5"
            )}
            data-testid="write-coverletter-card-output"
          >
          <CardContent className="flex flex-col bg-transparent p-6 h-full">
            <div className="flex-1 relative min-h-0">
              {!generatedLetter && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: isGenerating ? 1 : 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-base-content/50 text-base font-medium mb-2">
                      Your cover letter will appear here
                    </p>
                    <p className="text-base-content/50 text-sm">
                      Click the button below to generate
                    </p>
                  </div>
                </motion.div>
              )}
              <motion.div
                key={generatedLetter ? "letter-present" : "letter-empty"}
                initial={isNewlyGenerated ? { opacity: 0, scale: 0.95, y: 10 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut",
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
                }}
                className="h-full relative"
              >
                {/* Shimmer effect for newly generated content */}
                <AnimatePresence>
                  {isNewlyGenerated && generatedLetter && (
                    <>
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-10 rounded-lg overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                      
                      {/* Floating sparkles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={`sparkle-${i}`}
                          className="absolute w-2 h-2 pointer-events-none z-20"
                          style={{
                            left: `${20 + (i * 12)}%`,
                            top: `${10 + (i % 2) * 80}%`,
                          }}
                          initial={{ opacity: 0, scale: 0, y: 20 }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1, 1, 0],
                            y: [20, -30, -50, -80],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.1,
                            ease: "easeOut"
                          }}
                        >
                          <Sparkles className="w-full h-full text-primary" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
                <Textarea
                  value={generatedLetter}
                  readOnly
                  variant={generatedLetter ? "default" : "ghost"}
                  className={cn(
                    "resize-none transition-all duration-300 font-sans text-base h-full w-full",
                    !generatedLetter && "text-center opacity-0",
                    generatedLetter && !isNewlyGenerated && "shadow-inner bg-base-100/60 backdrop-blur-sm border-base-300/50 rounded-lg",
                    generatedLetter && isNewlyGenerated && "shadow-inner bg-success/10 backdrop-blur-sm border-success/30 rounded-lg"
                  )}
                  data-testid="write-coverletter-textarea-output"
                />
              </motion.div>
            </div>
            
            {/* Action Buttons */}
            <AnimatePresence>
              {generatedLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Button
                        onClick={handleExport}
                        variant="outline"
                        size="default"
                        elevation="sm"
                        leftIcon={<Download className="h-4 w-4" />}
                        className="w-full group font-medium"
                        data-testid="write-coverletter-button-export-trigger"
                      >
                        Export as Text
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Button
                        onClick={handleCopy}
                        variant={isCopied ? "gradient-blue" : "outline"}
                        size="default"
                        elevation="sm"
                        className="w-full group"
                        leftIcon={isCopied ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        )}
                        data-testid="write-coverletter-button-copy-trigger"
                      >
                        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                      </Button>
                    </div>
                  </div>
                  

                  {/* Application Routing Section - Full Width Button */}
                  {role.applicationInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="w-full"
                    >
                      <ApplicationActionButton
                        applicationInfo={role.applicationInfo}
                        className="w-full"
                        data-testid="cover-letter-application-button"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
} 