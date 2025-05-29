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
import { PlusCircle, Trash2, ArrowRight, Download, RefreshCw, Loader2, Copy, Check, Sparkles, Award, Target, Briefcase, FileText, CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InternalProfile, InternalAchievement } from "@/types/types"
import { Role } from "@/types/role"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CoverLetterCreatorProps {
  role: Role
  generationTrigger?: number
  onGenerationComplete?: (roleId: string, success: boolean) => void
  isMultiRoleMode?: boolean
}

// Custom styles injection
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
    @keyframes pulse-border {
      0%, 100% { border-color: rgba(139, 92, 246, 0.3); }
      50% { border-color: rgba(139, 92, 246, 0.6); }
    }
    .pulse-border {
      animation: pulse-border 2s ease-in-out infinite;
    }
  `
  document.head.appendChild(style)
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
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto",
      isMultiRoleMode ? "gap-4" : "gap-6"
    )}>
      {/* Left Column - Customization */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        {/* Header Card */}
        <Card className="overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white relative">
          <div className={cn("absolute inset-0 opacity-30", isGenerating ? "animate-shimmer" : "shimmer")}></div>
          <CardHeader className={cn("relative z-10", isMultiRoleMode ? "pb-4 pt-4" : "pb-6 pt-6")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: isGenerating ? 4 : 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 flex-shrink-0"
                >
                  <Sparkles className={cn("text-white", isMultiRoleMode ? "h-6 w-6" : "h-8 w-8")} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn("font-bold mb-2 text-white truncate", isMultiRoleMode ? "text-2xl" : "text-3xl")}>
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-violet-100 flex items-center gap-2 flex-wrap">
                    <span>at</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {role.company.name}
                    </Badge>
                    {role.location && (
                      <span className="text-violet-200 text-sm">• {role.location}</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {/* Generate Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !developerProfile}
                  variant="secondary"
                  size={isMultiRoleMode ? "default" : "lg"}
                  className={cn(
                    "bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 transition-all shadow-lg",
                    isMultiRoleMode ? "px-4 py-2" : "px-6 py-3"
                  )}
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
              <p className="text-xs text-violet-200 mt-2">
                Loading your profile data...
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Customization Card */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader 
            className="bg-slate-100 dark:bg-slate-900 transition-all duration-300"
            onClick={() => setIsPersonalizationExpanded(!isPersonalizationExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Personalize Your Application</CardTitle>
              </div>
              <motion.div
                animate={{ rotate: isPersonalizationExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
          </CardHeader>
          <AnimatePresence>
            {isPersonalizationExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
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
                <Briefcase className="h-4 w-4 text-violet-500" />
                How did you find this job?
                <Badge variant="secondary" size="sm" className="ml-auto">Optional</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="jobSource"
                  placeholder="e.g., LinkedIn, Company Website, Referral from John"
                  value={jobSource}
                  onChange={(e) => handleJobSourceChange(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500/20 transition-all pl-10"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <Award className="h-4 w-4 text-violet-500" />
                Your Key Achievements
                <Badge variant="default" size="sm" className="ml-auto bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {developerProfile?.achievements?.length || 0}
                </Badge>
              </Label>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
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
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 mb-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
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
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                      <Award className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
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
                  className="bg-white dark:bg-gray-900 focus:ring-2 focus:ring-violet-500/20 transition-all"
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
                <Target className="h-4 w-4 text-violet-500" />
                Why {role.company.name}?
                <Badge variant="default" size="sm" className="ml-auto bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {companyAttractionPoints.length}
                </Badge>
              </Label>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
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
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 mb-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-violet-500 flex-shrink-0" />
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
                  className="bg-white dark:bg-gray-900 focus:ring-2 focus:ring-violet-500/20 transition-all"
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

        {/* Progress Indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="p-5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30 pulse-border shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                  <div className="absolute inset-0 h-8 w-8 animate-ping opacity-30">
                    <Loader2 className="h-8 w-8 text-violet-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">AI is crafting your perfect cover letter...</p>
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
                  <div className="absolute inset-0 h-2 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 blur-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Column - Generated Letter */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        <Card className={cn(
          "border-0  hover:shadow-xl transition-all duration-150 h-full relative overflow-hidden"
        )}>
          {/* {generatedLetter && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 animate-pulse" />
          )} */}
          <CardContent className="flex flex-col bg-slate-100 dark:bg-slate-900">
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
                      <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mb-2">
                      Your cover letter will appear here
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
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
                  generatedLetter && "shadow-inner bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                )}
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
                        variant="gradient"
                        size="default"
                        rounded="xl"
                        className="w-full group shadow-md hover:shadow-lg transition-all duration-150"
                        elevation="sm"
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
                        rounded="xl"
                        className="w-full group shadow-md hover:shadow-lg transition-all duration-150"
                        elevation="sm"
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
                    className="relative overflow-hidden p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-md"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400" />
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                          Cover letter generated successfully!
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
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