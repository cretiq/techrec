"use client"

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from '@/components/ui-daisy/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { Textarea } from "@/components/ui-daisy/textarea"
import { Label } from "@/components/ui-daisy/label"
import { useToast } from "@/components/ui-daisy/use-toast"
import { ScrollArea } from "@/components/ui-daisy/scroll-area"
import { cn } from '@/lib/utils'
import { 
  FileText, Upload, Sparkles, Download, ArrowRight, 
  CheckCircle2, XCircle, ChevronDown, Target, Briefcase,
  Loader2, Copy, Check, Brain, Zap, TrendingUp,
  AlertCircle, FileUp, Edit3, RefreshCw
} from "lucide-react"
import { Progress } from "@/components/ui-daisy/progress"
import { Role } from "@/types/role"

// Animation variants
const scaleOnHover = { scale: 1.02 }
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

interface Suggestion {
  id: string
  category: 'impact' | 'keywords' | 'formatting' | 'clarity'
  original: string
  improved: string
  reasoning: string
  accepted?: boolean
}

interface CVOptimizerProps {
  role?: Role
  isMultiRoleMode?: boolean
}

export function CVOptimizer({ role, isMultiRoleMode = false }: CVOptimizerProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [acceptedCount, setAcceptedCount] = useState(0)
  const [isCustomizationExpanded, setIsCustomizationExpanded] = useState(!isMultiRoleMode)
  const [targetRole, setTargetRole] = useState(role?.title || '')
  const [targetCompany, setTargetCompany] = useState(role?.company.name || '')
  const [progressValue, setProgressValue] = useState(0)
  const [isNewlyOptimized, setIsNewlyOptimized] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Update target info when role changes
  useEffect(() => {
    if (role) {
      setTargetRole(role.title)
      setTargetCompany(role.company.name)
    }
  }, [role])

  // Progress animation during analysis
  useEffect(() => {
    if (isAnalyzing) {
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
  }, [isAnalyzing])

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCvText(text)
        toast({ 
          title: "CV Uploaded", 
          description: `Successfully loaded ${uploadedFile.name}` 
        })
      }
      reader.readAsText(uploadedFile)
    }
  }

  const analyzeCV = async () => {
    if (!cvText) {
      toast({ 
        title: "No CV Content", 
        description: "Please upload a CV or paste your content first.", 
        variant: "destructive" 
      })
      return
    }
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis with realistic suggestions
    setTimeout(() => {
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          category: 'impact',
          original: "Developed web applications using React",
          improved: `Engineered ${targetCompany ? `enterprise-grade` : 'scalable'} React applications serving 50K+ daily users, reducing load times by 40% through code splitting and lazy loading`,
          reasoning: "Quantifies impact with specific metrics and demonstrates technical optimization skills"
        },
        {
          id: '2',
          category: 'keywords',
          original: "Managed team projects",
          improved: `Led cross-functional team of 8 engineers in Agile environment, delivering ${targetRole ? 'full-stack' : ''} projects 20% ahead of schedule while maintaining 98% code coverage`,
          reasoning: `Includes relevant keywords for ${targetRole || 'technical roles'} and demonstrates leadership with measurable outcomes`
        },
        {
          id: '3',
          category: 'clarity',
          original: "Good problem solving skills",
          improved: "Architected innovative solutions to complex technical challenges, including a microservices migration that reduced system downtime by 75%",
          reasoning: "Replaces vague claims with specific technical achievements"
        },
        {
          id: '4',
          category: 'formatting',
          original: "Skills: JavaScript, Python, SQL, React, Node.js, Docker, AWS",
          improved: "Technical Stack: Frontend (React, TypeScript, Next.js) | Backend (Node.js, Python, GraphQL) | Cloud/DevOps (AWS, Docker, Kubernetes, CI/CD)",
          reasoning: "Organizes skills into logical categories for better ATS parsing and readability"
        }
      ]
      
      setSuggestions(mockSuggestions)
      setIsAnalyzing(false)
      setIsNewlyOptimized(true)
      setTimeout(() => setIsNewlyOptimized(false), 1500)
      
      toast({ 
        title: "Analysis Complete!", 
        description: `Found ${mockSuggestions.length} optimization opportunities for your CV.` 
      })
    }, 3000)
  }

  const handleSuggestion = (id: string, accept: boolean) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, accepted: accept } : s
    ))
    
    if (accept) {
      setAcceptedCount(prev => prev + 1)
    } else {
      setAcceptedCount(prev => Math.max(0, prev - 1))
    }
  }

  const applyAcceptedChanges = () => {
    let optimizedText = cvText
    suggestions.forEach(s => {
      if (s.accepted) {
        optimizedText = optimizedText.replace(s.original, s.improved)
      }
    })
    setCvText(optimizedText)
    toast({ 
      title: "Changes Applied!", 
      description: `Successfully applied ${acceptedCount} improvements to your CV.` 
    })
    setSuggestions([])
    setAcceptedCount(0)
  }

  const exportOptimizedCV = () => {
    const blob = new Blob([cvText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimized-cv-${targetRole ? targetRole.toLowerCase().replace(/\s+/g, '-') : 'export'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!cvText) {
      toast({ 
        title: "Nothing to Copy", 
        description: "Add CV content first.", 
        variant: "destructive" 
      })
      return
    }
    
    navigator.clipboard.writeText(cvText)
      .then(() => {
        toast({ title: "Copied!", description: "CV content copied to clipboard." })
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
        toast({ 
          title: "Copy Failed", 
          description: "Could not copy text to clipboard.", 
          variant: "destructive" 
        })
      })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'impact': return <TrendingUp className="h-4 w-4" />
      case 'keywords': return <Target className="h-4 w-4" />
      case 'clarity': return <Edit3 className="h-4 w-4" />
      case 'formatting': return <FileText className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'impact': return 'text-green-600 bg-green-100 border-green-300'
      case 'keywords': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'clarity': return 'text-purple-600 bg-purple-100 border-purple-300'
      case 'formatting': return 'text-orange-600 bg-orange-100 border-orange-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto",
      isMultiRoleMode ? "gap-4" : "gap-6"
    )}>
      {/* Left Column - Input & Customization */}
      <div className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}>
        {/* Header Card */}
        <Card 
          variant="transparent"
          data-testid="cv-optimizer-card-header"
        >
          <CardHeader className={cn(isMultiRoleMode ? "pb-4 pt-4" : "pb-6 pt-6")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div 
                  animate={{ rotate: isAnalyzing ? 360 : 0 }}
                  transition={{ 
                    duration: isAnalyzing ? 2 : 0.5, 
                    repeat: isAnalyzing ? Infinity : 0, 
                    ease: "linear" 
                  }}
                  className="p-3 bg-primary/10 backdrop-blur-md rounded-lg border border-primary/20 flex-shrink-0"
                >
                  <Brain className={cn("text-primary", isMultiRoleMode ? "h-6 w-6" : "h-8 w-8")} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn("font-bold mb-2 text-base-content", isMultiRoleMode ? "text-2xl" : "text-3xl")}>
                    CV Optimization
                  </CardTitle>
                  <CardDescription className="text-base-content/70 flex items-center gap-2 flex-wrap">
                    <span>AI-powered improvements</span>
                    {role && (
                      <>
                        <span>for</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                          {role.title}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {/* Analyze Button */}
              <motion.div
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={analyzeCV}
                  disabled={isAnalyzing || !cvText}
                  variant="default"
                  size={isMultiRoleMode ? "default" : "lg"}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-content transition-all",
                    isMultiRoleMode ? "px-4 py-2" : "px-6 py-3"
                  )}
                  data-testid="cv-optimizer-button-analyze"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className={cn("animate-spin", isMultiRoleMode ? "mr-2 h-4 w-4" : "mr-2 h-5 w-5")} />
                      <span className={cn(isMultiRoleMode ? "text-sm" : "text-base")}>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className={cn(isMultiRoleMode ? "mr-2 h-4 w-4" : "mr-2 h-5 w-5")} />
                      <span className={cn("font-semibold", isMultiRoleMode ? "text-sm" : "text-base")}>
                        Analyze CV
                      </span>
                      <ArrowRight className={cn("transition-transform group-hover:translate-x-1", isMultiRoleMode ? "ml-2 h-4 w-4" : "ml-2 h-5 w-5")} />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardHeader>
        </Card>

        {/* CV Upload/Input Card */}
        <motion.div variants={fadeInUp}>
          <Card 
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 rounded-lg"
            data-testid="cv-optimizer-card-input"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-base-content">Your CV Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.doc,.docx,.pdf"
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full bg-base-100/70 backdrop-blur-sm border-base-300/50 hover:bg-base-200"
                    size="lg"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload CV File
                  </Button>
                </motion.div>
                {file && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-base-content/60 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </motion.p>
                )}
              </div>
              
              {/* CV Text Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Or paste your CV content</Label>
                <Textarea
                  placeholder="Paste your CV text here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="min-h-[200px] bg-base-100/70 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  data-testid="cv-optimizer-textarea-input"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customization Card */}
        <motion.div variants={fadeInUp}>
          <Card 
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 rounded-lg"
            data-testid="cv-optimizer-card-customization"
          >
            <CardHeader 
              className="bg-base-100/30 backdrop-blur-sm transition-all duration-300 cursor-pointer"
              onClick={() => setIsCustomizationExpanded(!isCustomizationExpanded)}
              data-testid="cv-optimizer-header-customization-trigger"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg text-base-content">Target Position</CardTitle>
                </div>
                <motion.div
                  animate={{ rotate: isCustomizationExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-base-content/60" />
                </motion.div>
              </div>
            </CardHeader>
            <AnimatePresence>
              {isCustomizationExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <CardContent className={cn("space-y-4", isMultiRoleMode ? "pt-4" : "pt-6")}>
                    {/* Target Role */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="targetRole" className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Target Role
                        <Badge variant="secondary" size="sm" className="ml-auto">Optional</Badge>
                      </Label>
                      <div className="relative">
                        <input
                          id="targetRole"
                          type="text"
                          placeholder="e.g., Senior Full Stack Developer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full px-10 py-2 bg-base-100/70 backdrop-blur-sm border border-base-300/50 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                          data-testid="cv-optimizer-input-target-role"
                        />
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                      </div>
                    </motion.div>
                    
                    {/* Target Company */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="targetCompany" className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Target Company
                        <Badge variant="secondary" size="sm" className="ml-auto">Optional</Badge>
                      </Label>
                      <div className="relative">
                        <input
                          id="targetCompany"
                          type="text"
                          placeholder="e.g., Google, Microsoft, Startup"
                          value={targetCompany}
                          onChange={(e) => setTargetCompany(e.target.value)}
                          className="w-full px-10 py-2 bg-base-100/70 backdrop-blur-sm border border-base-300/50 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                          data-testid="cv-optimizer-input-target-company"
                        />
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
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
          {isAnalyzing && (
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
                  <p className="text-base font-semibold text-base-content">AI is analyzing your CV...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scanning for optimization opportunities and ATS improvements
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>Finding improvement areas</span>
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

      {/* Right Column - Suggestions & Output */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        <motion.div
          animate={isNewlyOptimized ? {
            boxShadow: [
              "0 0 0 0 rgba(139, 92, 246, 0)",
              "0 0 20px 4px rgba(139, 92, 246, 0.5)",
              "0 0 40px 8px rgba(139, 92, 246, 0.3)",
              "0 0 0 0 rgba(139, 92, 246, 0)"
            ]
          } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-lg"
        >
          <Card 
            className={cn(
              "bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 h-full relative overflow-hidden rounded-lg"
            )}
            data-testid="cv-optimizer-card-suggestions"
          >
            <CardContent className="flex flex-col bg-transparent p-6">
              <div className="flex-1 relative">
                {!suggestions.length && !isAnalyzing && (
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
                          duration: isAnalyzing ? 1 : 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Zap className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-base-content/50 text-base font-medium mb-2">
                        Optimization suggestions will appear here
                      </p>
                      <p className="text-base-content/50 text-sm">
                        Click "Analyze CV" to get AI-powered improvements
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Suggested Improvements
                      </h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {acceptedCount} of {suggestions.length} accepted
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-[400px] pr-4">
                      <AnimatePresence mode="popLayout">
                        {suggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                            className="mb-4"
                          >
                            <Card className={cn(
                              "bg-base-100/40 backdrop-blur-sm border transition-all duration-100",
                              suggestion.accepted === true && "border-success/50 bg-success/5",
                              suggestion.accepted === false && "border-error/50 bg-error/5",
                              suggestion.accepted === undefined && "border-base-300/50 hover:border-base-300"
                            )}>
                              <CardContent className="p-4 space-y-3">
                                {/* Category Badge */}
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    size="sm"
                                    className={cn("flex items-center gap-1", getCategoryColor(suggestion.category))}
                                  >
                                    {getCategoryIcon(suggestion.category)}
                                    {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                                  </Badge>
                                  {suggestion.accepted === true && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <CheckCircle2 className="h-5 w-5 text-success" />
                                    </motion.div>
                                  )}
                                  {suggestion.accepted === false && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <XCircle className="h-5 w-5 text-error" />
                                    </motion.div>
                                  )}
                                </div>
                                
                                {/* Original Text */}
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-base-content/60">Original:</p>
                                  <p className="text-sm line-through opacity-60">{suggestion.original}</p>
                                </div>
                                
                                {/* Improved Text */}
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-success">Suggested:</p>
                                  <p className="text-sm font-medium">{suggestion.improved}</p>
                                </div>
                                
                                {/* Reasoning */}
                                <div className="flex items-start gap-2 p-2 bg-info/10 rounded-lg border border-info/20">
                                  <AlertCircle className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-info-content">{suggestion.reasoning}</p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                  <motion.div 
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1"
                                  >
                                    <Button
                                      onClick={() => handleSuggestion(suggestion.id, true)}
                                      disabled={suggestion.accepted === true}
                                      variant={suggestion.accepted === true ? "gradient" : "default"}
                                      size="sm"
                                      className="w-full"
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Accept
                                    </Button>
                                  </motion.div>
                                  <motion.div 
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1"
                                  >
                                    <Button
                                      onClick={() => handleSuggestion(suggestion.id, false)}
                                      disabled={suggestion.accepted === false}
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </motion.div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </ScrollArea>
                    
                    {/* Apply Changes Button */}
                    {acceptedCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-success/10 backdrop-blur-sm rounded-lg border border-success/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-success/20 rounded-lg">
                              <Sparkles className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-success">
                                Ready to optimize!
                              </p>
                              <p className="text-xs text-success/80">
                                {acceptedCount} improvement{acceptedCount !== 1 ? 's' : ''} selected
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={applyAcceptedChanges}
                            variant="gradient"
                            size="sm"
                            className="shadow-lg"
                          >
                            Apply Changes
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <AnimatePresence>
                {cvText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Button
                          onClick={exportOptimizedCV}
                          variant="default"
                          size="default"
                          className="w-full group bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 backdrop-blur-sm shadow-md transition-all duration-150 font-medium rounded-lg"
                          data-testid="cv-optimizer-button-export"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export CV
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Button
                          onClick={handleCopy}
                          variant={isCopied ? "gradient" : "outline"}
                          size="default"
                          className="w-full group shadow-md transition-all duration-150 rounded-lg"
                          data-testid="cv-optimizer-button-copy"
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
                      </div>
                    </div>
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