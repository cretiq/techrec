"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from '@/components/ui-daisy/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { Textarea } from "@/components/ui-daisy/textarea"
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui-daisy/input'
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/store'
import { setCoverLetter, selectCoverLetter, updateCoverLetterJobSource, updateCoverLetterAttractionPoints } from '@/lib/features/coverLettersSlice'
import { PlusCircle, Trash2, ArrowRight, Download, RefreshCw, Loader2, Copy, Check, Sparkles, Award, Target, Briefcase, FileText, CheckCircle2, ChevronRight, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InternalProfile, InternalAchievement } from "@/types/types"
import { Role } from "@/types/role"
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
  isMultiRoleMode?: boolean
}

export function CoverLetterCreator({ role, generationTrigger, onGenerationComplete, isMultiRoleMode = false }: CoverLetterCreatorProps) {
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  
  // Get cover letter from Redux (if it exists)
  const existingCoverLetter = useSelector((state: RootState) => selectCoverLetter(state, role.id))
  
  const [developerProfile, setDeveloperProfile] = useState<InternalProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newAchievementTitle, setNewAchievementTitle] = useState<string>("")
  const [newAttractionPoint, setNewAttractionPoint] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [isPersonalizationExpanded, setIsPersonalizationExpanded] = useState(!isMultiRoleMode)
  
  // Use Redux state or default values
  const generatedLetter = existingCoverLetter?.letter || ""
  const jobSource = existingCoverLetter?.jobSource || ""
  const companyAttractionPoints = existingCoverLetter?.companyAttractionPoints || [
    "Innovative products in the tech space",
    "Strong company culture and values"
  ]
  
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
    if (generationTrigger && generationTrigger > 0 && developerProfile && !isGenerating) {
      console.log(`[CoverLetterCreator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. Profile loaded: ${!!developerProfile}. Triggering generation.`);
      handleGenerate();
    } else if (generationTrigger && generationTrigger > 0 && !developerProfile) {
        console.log(`[CoverLetterCreator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. Profile NOT loaded yet. Generation deferred.`);
    }
  }, [generationTrigger]);

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

  const handleJobSourceChange = (newJobSource: string) => {
    dispatch(updateCoverLetterJobSource({ roleId: role.id, jobSource: newJobSource }))
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
      }

      console.log("Sending request data:", JSON.stringify(requestData, null, 2))

      const response = await fetch("/api/generate-cover-letter-gemini", {
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
        companyAttractionPoints
      }))
      
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
        isMultiRoleMode ? "gap-4" : "gap-6"
      )}
    >
      {/* Left Column - Customization */}
      <div 
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        {/* Header Card */}
        <Card 
          className="overflow-hidden bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:shadow-lg transition-all duration-300 rounded-lg"
          data-testid="write-coverletter-card-header"
        >
            <CardHeader className={cn(isMultiRoleMode ? "pb-4 pt-4" : "pb-6 pt-6")}>
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
                  <CardTitle className={cn("font-bold mb-2 text-base-content truncate", isMultiRoleMode ? "text-2xl" : "text-3xl")}>
                    {role.title}
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
              
              {/* Generate Button */}
              <motion.div
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !developerProfile}
                  variant="default"
                  size={isMultiRoleMode ? "default" : "lg"}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-content border-0 transition-all shadow-md hover:shadow-lg",
                    isMultiRoleMode ? "px-4 py-2" : "px-6 py-3"
                  )}
                  data-testid="write-coverletter-button-generate-trigger"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className={cn("animate-spin", isMultiRoleMode ? "mr-2 h-4 w-4" : "mr-2 h-5 w-5")} />
                      <span className={cn(isMultiRoleMode ? "text-sm" : "text-base")}>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className={cn(isMultiRoleMode ? "mr-2 h-4 w-4" : "mr-2 h-5 w-5")} />
                      <span className={cn("font-semibold", isMultiRoleMode ? "text-sm" : "text-base")}>
                        {generatedLetter ? 'Regenerate' : 'Generate'}
                      </span>
                      <ArrowRight className={cn("transition-transform group-hover:translate-x-1", isMultiRoleMode ? "ml-2 h-4 w-4" : "ml-2 h-5 w-5")} />
                    </>
                  )}
                </Button>
              </motion.div>
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
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:shadow-lg transition-all duration-300 rounded-lg"
            data-testid="write-coverletter-card-customization"
          >
            <CardHeader 
              className="bg-base-100/30 backdrop-blur-sm transition-all duration-300 cursor-pointer"
              onClick={() => setIsPersonalizationExpanded(!isPersonalizationExpanded)}
              data-testid="write-coverletter-header-personalization-trigger"
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-base-content">Personalize Your Application</CardTitle>
              </div>
              <motion.div
                animate={{ rotate: isPersonalizationExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-base-content/60" />
              </motion.div>
            </div>
            </CardHeader>
            <AnimatePresence>
              {isPersonalizationExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                <CardContent className={cn("space-y-6", isMultiRoleMode ? "pt-4" : "pt-6")}>
            {/* Job Source Input */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="jobSource" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                How did you find this job?
                <Badge variant="secondary" size="sm" className="ml-auto">Optional</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="jobSource"
                  placeholder="e.g., LinkedIn, Company Website, Referral from John"
                  value={jobSource}
                  onChange={(e) => handleJobSourceChange(e.target.value)}
                  className="bg-base-100/70 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all pl-10 rounded-lg"
                  data-testid="write-coverletter-input-job-source"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
              </div>
            </motion.div>
            
            {/* Achievements Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Your Key Achievements
                <Badge variant="secondary" size="sm" className="ml-auto bg-primary/20 text-primary">
                  {developerProfile?.achievements?.length || 0}
                </Badge>
              </Label>
              <div 
                className="bg-base-100/40 backdrop-blur-sm rounded-lg p-4 border border-base-300/50 shadow-inner"
                data-testid="write-coverletter-container-achievements"
              >
                <ScrollArea className="h-32">
                  <AnimatePresence mode="popLayout">
                    {(developerProfile?.achievements || []).map((achievement: InternalAchievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.02 }}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-base-100/80 backdrop-blur-sm transition-all duration-200 mb-2 border border-transparent hover:border-base-300/50 hover:shadow-md"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        </motion.div>
                        <p className="text-sm flex-1 truncate" title={achievement.title}>
                          {achievement.title}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-error/10"
                          onClick={() => handleRemoveAchievement(achievement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {(!developerProfile?.achievements || developerProfile.achievements.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Award className="h-8 w-8 text-base-content/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No achievements added yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add your key accomplishments to personalize your letter
                      </p>
                    </motion.div>
                  )}
                </ScrollArea>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="E.g., Led team of 5 to deliver project 2 weeks early"
                  value={newAchievementTitle}
                  onChange={(e) => setNewAchievementTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAchievement()}
                  className="bg-base-100/60 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  data-testid="write-coverletter-input-add-achievement"
                />
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="gradient"
                    size="default"
                    onClick={handleAddAchievement}
                    disabled={!newAchievementTitle.trim()}
                    className="px-4 shadow-md hover:shadow-lg transition-all duration-150"
                    data-testid="write-coverletter-button-add-achievement-trigger"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Company Attraction Points */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Why {role.company.name}?
                <Badge variant="secondary" size="sm" className="ml-auto bg-primary/20 text-primary">
                  {companyAttractionPoints.length}
                </Badge>
              </Label>
              <div 
                className="bg-base-100/40 backdrop-blur-sm rounded-lg p-4 border border-base-300/50 shadow-inner"
                data-testid="write-coverletter-container-attraction-points"
              >
                <ScrollArea className="h-32">
                  <AnimatePresence mode="popLayout">
                    {companyAttractionPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.02 }}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-base-100/80 backdrop-blur-sm transition-all duration-200 mb-2 border border-transparent hover:border-base-300/50 hover:shadow-md"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                        </motion.div>
                        <p className="text-sm flex-1">{point}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveAttractionPoint(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ScrollArea>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="E.g., Innovative AI products, great work-life balance"
                  value={newAttractionPoint}
                  onChange={(e) => setNewAttractionPoint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttractionPoint()}
                  className="bg-base-100/60 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  data-testid="write-coverletter-input-add-attraction-point"
                />
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="gradient"
                    size="default"
                    onClick={handleAddAttractionPoint}
                    disabled={!newAttractionPoint.trim()}
                    className="px-4 shadow-md hover:shadow-lg transition-all duration-150"
                    data-testid="write-coverletter-button-add-attraction-point-trigger"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
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
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        <Card 
          className={cn(
            "bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden rounded-lg"
          )}
          data-testid="write-coverletter-card-output"
        >
          <CardContent className="flex flex-col bg-transparent p-6">
            <div className="flex-1 relative">
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
              <Textarea
                value={generatedLetter}
                readOnly
                variant={generatedLetter ? "default" : "ghost"}
                className={cn(
                  "resize-none transition-all duration-300 font-sans text-base h-full",
                  isMultiRoleMode ? "min-h-[350px]" : "min-h-[300px]",
                  !generatedLetter && "text-center opacity-0",
                  generatedLetter && "shadow-inner bg-base-100/60 backdrop-blur-sm border-base-300/50 rounded-lg"
                )}
                data-testid="write-coverletter-textarea-output"
              />
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
                    <motion.div 
                      className="flex-1" 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Button
                        onClick={handleExport}
                        variant="default"
                        size="default"
                        className="w-full group bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-150 font-medium rounded-lg"
                        data-testid="write-coverletter-button-export-trigger"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as Text
                      </Button>
                    </motion.div>
                    <motion.div 
                      className="flex-1" 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Button
                        onClick={handleCopy}
                        variant={isCopied ? "gradient-blue" : "outline"}
                        size="default"
                        className="w-full group shadow-md hover:shadow-lg transition-all duration-150 rounded-lg"
                        elevation="sm"
                        data-testid="write-coverletter-button-copy-trigger"
                      >
                        {isCopied ? (
                          <>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                            </motion.div>
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden p-4 bg-success/10 backdrop-blur-sm rounded-lg border border-success/30 shadow-md"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-success to-success" />
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="p-2 bg-success/20 rounded-lg"
                      >
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-success">
                          Cover letter generated successfully!
                        </p>
                        <p className="text-xs text-success/80 mt-0.5">
                          Personalized for {role.title} at {role.company.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 