"use client"

import { useState, useEffect, useRef } from "react"
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
import { 
  setOutreachMessage, 
  selectOutreachMessage,
  updateOutreachRecipient,
  updateOutreachConnectionPoints 
} from '@/lib/features/outreachMessagesSlice'
import { 
  PlusCircle, 
  Trash2, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  Mail, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InternalProfile } from "@/types/types"
import { Role } from "@/types/role"
import { cn } from "@/lib/utils"
import { Select } from '@/components/ui-daisy/select'

// Animation variants
const scaleOnHover = { scale: 1.02 };
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

interface MessageVariation {
  content: string
  platform: string
  tone: string
}


interface OutreachMessageGeneratorProps {
  role: Role
  generationTrigger?: number
  onGenerationComplete?: (roleId: string, success: boolean) => void
  isMultiRoleMode?: boolean
}

export function OutreachMessageGenerator({ 
  role, 
  generationTrigger, 
  onGenerationComplete, 
  isMultiRoleMode = false 
}: OutreachMessageGeneratorProps) {
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  
  // Get existing outreach message from Redux
  const existingOutreach = useSelector((state: RootState) => selectOutreachMessage(state, role.id))
  
  const [developerProfile, setDeveloperProfile] = useState<InternalProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [recipientName, setRecipientName] = useState(existingOutreach?.recipientName || "")
  const [recipientTitle, setRecipientTitle] = useState(existingOutreach?.recipientTitle || "")
  const [recipientCompany, setRecipientCompany] = useState(existingOutreach?.recipientCompany || role.company.name)
  const [context, setContext] = useState(existingOutreach?.context || "")
  const [platform, setPlatform] = useState(existingOutreach?.platform || "linkedin")
  const [messageVariations, setMessageVariations] = useState<MessageVariation[]>(existingOutreach?.variations || [])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [connectionPoints, setConnectionPoints] = useState<string[]>(existingOutreach?.connectionPoints || [
    "Shared interest in innovative technology",
    "Similar professional background"
  ])
  const [newConnectionPoint, setNewConnectionPoint] = useState("")
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastTriggeredValue, setLastTriggeredValue] = useState<number>(0)

  // Platform icons
  const platformIcons = {
    linkedin: Linkedin,
    email: Mail,
    twitter: Twitter,
    github: Github
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developer/me/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data: InternalProfile = await response.json()
        setDeveloperProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({ 
          title: "Error Loading Profile", 
          description: "Could not load your profile data.", 
          variant: "destructive" 
        })
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
    // 5. No messages exist yet (skip roles with existing content)
    if (
      generationTrigger && 
      generationTrigger > 0 && 
      generationTrigger !== lastTriggeredValue &&
      developerProfile && 
      !isGenerating &&
      messageVariations.length === 0 // Only generate for "Generate All" if no messages exist yet
    ) {
      console.log(`[OutreachMessageGenerator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}`)
      
      // Mark this trigger value as processed
      setLastTriggeredValue(generationTrigger)
      
      // For batch generation, use default recipient info if not provided
      let effectiveRecipientName = recipientName;
      if (!effectiveRecipientName && isMultiRoleMode) {
        effectiveRecipientName = "Hiring Manager";
        setRecipientName("Hiring Manager")
        setRecipientTitle("Recruiter")
        // Also update Redux
        dispatch(updateOutreachRecipient({
          roleId: role.id,
          recipientName: "Hiring Manager",
          recipientTitle: "Recruiter",
          recipientCompany
        }))
      }
      
      // Add a small delay to ensure state updates have time to apply
      setTimeout(() => {
        handleGenerate(effectiveRecipientName)
      }, 100)
    } else if (
      generationTrigger && 
      generationTrigger > 0 && 
      generationTrigger !== lastTriggeredValue &&
      messageVariations.length > 0 // Messages already exist
    ) {
      console.log(`[OutreachMessageGenerator] External trigger detected for role ${role.id}, trigger: ${generationTrigger}. Messages already exist. Skipping generation.`)
      // Mark this trigger as processed even though we skipped generation
      setLastTriggeredValue(generationTrigger)
      // Report completion immediately since we're skipping
      onGenerationComplete?.(role.id, true)
    }
  }, [generationTrigger, lastTriggeredValue, developerProfile, isGenerating, messageVariations.length, isMultiRoleMode, recipientName, role.id])


  const handleAddConnectionPoint = () => {
    if (newConnectionPoint.trim() === '') return
    const updatedPoints = [...connectionPoints, newConnectionPoint]
    setConnectionPoints(updatedPoints)
    setNewConnectionPoint('')
    // Update Redux
    dispatch(updateOutreachConnectionPoints({
      roleId: role.id,
      connectionPoints: updatedPoints
    }))
  }

  const handleRemoveConnectionPoint = (index: number) => {
    const updatedPoints = [...connectionPoints]
    updatedPoints.splice(index, 1)
    setConnectionPoints(updatedPoints)
    // Update Redux
    dispatch(updateOutreachConnectionPoints({
      roleId: role.id,
      connectionPoints: updatedPoints
    }))
  }

  const handleRegenerate = () => {
    // Reset trigger tracking to allow manual regeneration
    setLastTriggeredValue(0)
    handleGenerate()
  }

  const handleGenerate = async (overrideRecipientName?: string) => {
    if (!developerProfile) {
      toast({
        title: "Error",
        description: "Profile data not loaded yet. Please wait.",
        variant: "destructive",
      })
      onGenerationComplete?.(role.id, false)
      return
    }

    const effectiveRecipientName = overrideRecipientName || recipientName;
    if (!effectiveRecipientName) {
      // Only show error for manual generation, not batch generation
      if (!isMultiRoleMode) {
        toast({
          title: "Missing Information",
          description: "Please provide the recipient's name.",
          variant: "destructive",
        })
        return
      } else {
        // For batch generation, fail silently and report completion
        onGenerationComplete?.(role.id, false)
        return
      }
    }

    console.log(`[OutreachMessageGenerator] Starting generation for role ${role.id}, recipient: ${effectiveRecipientName}`)
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
        recipientInfo: {
          name: effectiveRecipientName,
          title: recipientTitle,
          company: recipientCompany
        },
        context: context,
        connectionPoints: connectionPoints,
        platform: platform
      }

      console.log(`[OutreachMessageGenerator] Sending request to API:`, requestData)
      const response = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log(`[OutreachMessageGenerator] API response status:`, response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`[OutreachMessageGenerator] API error:`, errorData)
        throw new Error(errorData.error || "Failed to generate outreach messages")
      }

      const data = await response.json()
      console.log(`[OutreachMessageGenerator] API response data:`, data)
      const variations = data.variations || []
      setMessageVariations(variations)
      
      // Save to Redux
      dispatch(setOutreachMessage({
        roleId: role.id,
        recipientName: effectiveRecipientName,
        recipientTitle,
        recipientCompany,
        context,
        connectionPoints,
        platform,
        variations,
        generatedAt: new Date().toISOString()
      }))
      
      // Trigger celebration animation
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
      
      success = true
    } catch (error) {
      console.error("Generate Outreach Message Error:", error)
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setSelectedVariation(index)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Copied to Clipboard",
      description: "Message has been copied to your clipboard.",
    })
  }

  const downloadMessage = () => {
    if (selectedVariation === null || !messageVariations[selectedVariation]) return
    
    const message = messageVariations[selectedVariation]
    const blob = new Blob([message.content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outreach-message-${role.company.name}-${platform}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const PlatformIcon = platformIcons[platform as keyof typeof platformIcons] || Mail

  return (
    <motion.div 
      variants={fadeInUp} 
      initial="hidden" 
      animate="visible"
      className="grid gap-6 lg:grid-cols-2 relative"
      data-testid="write-outreach-container-main"
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="write-outreach-overlay-celebration"
          >
            {/* Confetti burst */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded"
                style={{
                  backgroundColor: i % 4 === 0 ? '#22c55e' : i % 4 === 1 ? '#3b82f6' : i % 4 === 2 ? '#f59e0b' : '#ef4444',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 600],
                  y: [0, (Math.random() - 0.5) * 400],
                  rotate: [0, Math.random() * 720],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
                data-testid={`write-outreach-confetti-particle-${i}`}
              />
            ))}
            
            {/* Success text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
              data-testid="write-outreach-celebration-text-container"
            >
              <div 
                className="bg-gradient-to-r from-success to-primary text-white px-6 py-3 rounded-lg shadow-lg font-bold text-lg"
                data-testid="write-outreach-celebration-text-message"
              >
                🎉 Messages Generated!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left Column - Customization */}
      <div 
        className={cn(isMultiRoleMode ? "space-y-4" : "space-y-6")}
      >
        {/* Minimal Header - Just Role Title, Company, and Generate Button */}
        <Card 
          variant="transparent"
          data-testid="write-outreach-card-header"
        >
          <CardHeader className={cn("pb-2 pt-4")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className={cn("font-bold text-base-content truncate", isMultiRoleMode ? "text-lg" : "text-xl")}>
                  {role.title}
                </CardTitle>
                <CardDescription className="text-base-content/70 text-sm">
                  at {role.company.name}
                  {role.location && <span className="text-base-content/60"> • {role.location}</span>}
                </CardDescription>
              </div>
              
              {/* Generate Button */}
              <motion.div
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={() => handleGenerate(recipientName)}
                  disabled={isGenerating || !developerProfile}
                  variant="default"
                  size="default"
                  className="bg-primary hover:bg-primary/90 text-primary-content transition-all px-4 py-2"
                  data-testid="write-outreach-button-generate-trigger"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                      <span className="text-sm">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="font-semibold text-sm">
                        {messageVariations.length > 0 ? 'Regenerate' : 'Generate'}
                      </span>
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
          
        {/* Personalize Your Application Card */}
        <motion.div variants={fadeInUp}>
          <Card 
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 rounded-lg"
            data-testid="write-outreach-card-customization"
          >
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-medium text-base-content mb-4">Personalize your application</h3>
              
              {/* Recipient Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-base-content/70">Recipient Name</label>
                <Input
                  placeholder="e.g., Sarah Johnson, John Smith"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value)
                    dispatch(updateOutreachRecipient({
                      roleId: role.id,
                      recipientName: e.target.value,
                      recipientTitle,
                      recipientCompany
                    }))
                  }}
                  className="bg-base-100/70 backdrop-blur-sm border-base-300/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  data-testid="write-outreach-input-recipient-name"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-base-content/70">Platform</label>
                <div className="flex gap-2 flex-wrap">
                  {(["linkedin", "email", "twitter"] as const).map((platformOption) => {
                    const PlatformIcon = platformIcons[platformOption]
                    return (
                      <Button
                        key={platformOption}
                        variant={platform === platformOption ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlatform(platformOption)}
                        className={cn(
                          "transition-all duration-200 capitalize",
                          platform === platformOption 
                            ? "bg-primary text-primary-content shadow-md" 
                            : "bg-base-100/60 hover:bg-base-100/80 text-base-content border-base-300/50"
                        )}
                        data-testid={`write-outreach-button-platform-${platformOption}`}
                      >
                        <PlatformIcon className="mr-2 h-4 w-4" />
                        {platformOption}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
                              data-testid="write-outreach-input-recipient-title"
                            />
                          </div>
                          <div data-testid="write-outreach-field-recipient-company">
                            <Label 
                              className="text-sm font-medium"
                              data-testid="write-outreach-label-recipient-company"
                            >
                              Company
                            </Label>
                            <Input
                              value={recipientCompany}
                              onChange={(e) => {
                                setRecipientCompany(e.target.value)
                                dispatch(updateOutreachRecipient({
                                  roleId: role.id,
                                  recipientName,
                                  recipientTitle,
                                  recipientCompany: e.target.value
                                }))
                              }}
                              className="mt-1.5 bg-base-100/80"
                              data-testid="write-outreach-input-recipient-company"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Platform Selection */}
                      <div data-testid="write-outreach-section-platform">
                        <Label 
                          className="text-sm font-medium"
                          data-testid="write-outreach-label-platform"
                        >
                          Platform
                        </Label>
                        <Select 
                          value={platform} 
                          onChange={(e) => setPlatform(e.target.value)}
                          className="mt-1.5 bg-base-100/80"
                          data-testid="write-outreach-select-platform-trigger"
                        >
                          <option value="linkedin" data-testid="write-outreach-option-platform-linkedin">LinkedIn</option>
                          <option value="email" data-testid="write-outreach-option-platform-email">Email</option>
                          <option value="twitter" data-testid="write-outreach-option-platform-twitter">Twitter</option>
                          <option value="github" data-testid="write-outreach-option-platform-github">GitHub</option>
                        </Select>
                      </div>

                      {/* Connection Points */}
                      <div data-testid="write-outreach-section-connection-points">
                        <Label 
                          className="text-sm font-medium mb-2 block"
                          data-testid="write-outreach-label-connection-points"
                        >
                          Connection Points
                        </Label>
                        <div className="space-y-2" data-testid="write-outreach-container-connection-points">
                          {connectionPoints.map((point, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 p-2 rounded-lg bg-base-100/50 group"
                              data-testid={`write-outreach-item-connection-point-${index}`}
                            >
                              <CheckCircle2 
                                className="h-4 w-4 text-success shrink-0" 
                                data-testid={`write-outreach-icon-connection-point-${index}`}
                              />
                              <span 
                                className="text-sm flex-grow"
                                data-testid={`write-outreach-text-connection-point-${index}`}
                              >
                                {point}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveConnectionPoint(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                data-testid={`write-outreach-button-remove-connection-point-${index}`}
                              >
                                <Trash2 
                                  className="h-3 w-3 text-error" 
                                  data-testid={`write-outreach-icon-remove-connection-point-${index}`}
                                />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2" data-testid="write-outreach-container-add-connection-point">
                          <Input
                            placeholder="Add a connection point..."
                            value={newConnectionPoint}
                            onChange={(e) => setNewConnectionPoint(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddConnectionPoint()}
                            className="flex-grow bg-base-100/80"
                            data-testid="write-outreach-input-new-connection-point"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={handleAddConnectionPoint}
                            disabled={!newConnectionPoint.trim()}
                            data-testid="write-outreach-button-add-connection-point-trigger"
                          >
                            <PlusCircle 
                              className="h-4 w-4" 
                              data-testid="write-outreach-icon-add-connection-point"
                            />
                          </Button>
                        </div>
                      </div>

                      {/* Additional Context */}
                      <div data-testid="write-outreach-section-context">
                        <Label 
                          className="text-sm font-medium"
                          data-testid="write-outreach-label-context"
                        >
                          Additional Context
                        </Label>
                        <Textarea
                          placeholder="Mention any specific reason for reaching out, mutual connections, or topics to discuss..."
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          className="mt-1.5 min-h-[100px] bg-base-100/80"
                          data-testid="write-outreach-input-context"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

          {/* Generate Button with Orbital Animation */}
          <motion.div 
            whileHover={scaleOnHover} 
            whileTap={{ scale: 0.98 }}
            className="relative"
            data-testid="write-outreach-container-generate-button"
          >
            {/* Orbital rings when generating */}
            {isGenerating && (
              <div 
                className="absolute inset-0 pointer-events-none"
                data-testid="write-outreach-animation-orbital-rings"
              >
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  data-testid="write-outreach-ring-primary"
                />
                <motion.div
                  className="absolute inset-0 border-2 border-secondary/30 rounded-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.2, 0.4]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  data-testid="write-outreach-ring-secondary"
                />
                
              </div>
            )}
            
            <Button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !recipientName}
              className="relative w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg overflow-hidden"
              data-testid="write-outreach-button-generate-trigger"
            >
              {/* Pulse wave effect when generating */}
              {isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  data-testid="write-outreach-button-pulse-wave"
                />
              )}
              
              <div 
                className="relative z-10 flex items-center justify-center"
                data-testid="write-outreach-button-content"
              >
                {isGenerating ? (
                  <>
                    {/* Orbital loading animation */}
                    <div 
                      className="relative mr-2 w-5 h-5"
                      data-testid="write-outreach-loading-orbital-container"
                    >
                      <motion.div
                        className="absolute inset-0 border-2 border-white/30 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        data-testid="write-outreach-loading-ring"
                      />
                      <motion.div
                        className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '50% 10px' }}
                        data-testid="write-outreach-loading-dot-1"
                      />
                      <motion.div
                        className="absolute top-1/2 left-0 w-1 h-1 bg-white/70 rounded-full transform -translate-y-1/2"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '10px 50%' }}
                        data-testid="write-outreach-loading-dot-2"
                      />
                    </div>
                    <motion.span
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      data-testid="write-outreach-text-generating"
                    >
                      Generating Messages...
                    </motion.span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      data-testid="write-outreach-icon-sparkles"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                    </motion.div>
                    <span data-testid="write-outreach-text-button">Generate Outreach Messages</span>
                  </>
                )}
              </div>
            </Button>
          </motion.div>

          {/* Tips */}
          <div 
            className="p-4 rounded-lg bg-info/10 border border-info/20"
            data-testid="write-outreach-card-tips"
          >
            <h4 
              className="text-sm font-semibold text-info mb-2"
              data-testid="write-outreach-title-tips"
            >
              Pro Tips:
            </h4>
            <ul 
              className="text-xs space-y-1 text-base-content/70"
              data-testid="write-outreach-list-tips"
            >
              <li data-testid="write-outreach-tip-1">• Be specific about shared interests or connections</li>
              <li data-testid="write-outreach-tip-2">• Mention something unique about their work or company</li>
              <li data-testid="write-outreach-tip-3">• Keep it concise - respect their time</li>
              <li data-testid="write-outreach-tip-4">• End with a clear call to action</li>
            </ul>
          </div>
      </div>

      {/* Right Panel - Generated Messages */}
      <div 
        className="bg-gradient-to-br from-secondary/5 via-accent/5 to-primary/5 backdrop-blur-sm border border-base-300/50 rounded-lg shadow-lg p-6"
        data-testid="write-outreach-card-messages-container"
      >
        {/* Header Section */}
        <div className="space-y-2 mb-6" data-testid="write-outreach-header-messages">
          <div 
            className="flex items-center gap-3"
            data-testid="write-outreach-header-messages-title"
          >
            <motion.div
              animate={isGenerating ? { rotate: [0, 360] } : {}}
              transition={isGenerating ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
              data-testid="write-outreach-icon-platform"
            >
              <PlatformIcon className="h-5 w-5 text-primary" />
            </motion.div>
            <h3 
              className="text-lg font-bold"
              data-testid="write-outreach-title-messages"
            >
              Generated Messages
            </h3>
            
            {/* Status badge */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  key="generating-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1"
                  data-testid="write-outreach-badge-generating"
                >
                  <div 
                    className="w-2 h-2 bg-primary rounded-full animate-pulse" 
                    data-testid="write-outreach-dot-generating"
                  />
                  <span 
                    className="text-xs text-primary font-medium"
                    data-testid="write-outreach-text-badge-generating"
                  >
                    Generating...
                  </span>
                </motion.div>
              )}
              {!isGenerating && messageVariations.length > 0 && (
                <motion.div
                  key="complete-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1"
                  data-testid="write-outreach-badge-complete"
                >
                  <div 
                    className="w-2 h-2 bg-success rounded-full" 
                    data-testid="write-outreach-dot-complete"
                  />
                  <span 
                    className="text-xs text-success font-medium"
                    data-testid="write-outreach-text-badge-complete"
                  >
                    Complete
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p 
            className="text-sm text-base-content/70"
            data-testid="write-outreach-text-messages-status"
          >
            {messageVariations.length > 0 
              ? `${messageVariations.length} variations generated` 
              : isGenerating 
                ? "Generating your personalized messages..."
                : "Your messages will appear here"}
          </p>
        </div>
          {messageVariations.length > 0 ? (
            <div className="space-y-4" data-testid="write-outreach-container-messages-list">
              <ScrollArea 
                className="h-[500px] pr-4"
                data-testid="write-outreach-scroll-messages"
              >
                <div 
                  className="space-y-4"
                  data-testid="write-outreach-container-message-cards"
                >
                  {messageVariations.map((variation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                          selectedVariation === index 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-base-100/50"
                        )}
                        onClick={() => setSelectedVariation(index)}
                        data-testid={`write-outreach-card-message-item-${index}`}
                      >
                        {/* Magical shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                          data-testid={`write-outreach-shimmer-effect-${index}`}
                        />
                        
                        <CardContent 
                          className="p-4 space-y-3 relative"
                          data-testid={`write-outreach-card-content-${index}`}
                        >
                          <div 
                            className="flex items-center justify-between"
                            data-testid={`write-outreach-header-message-${index}`}
                          >
                            <div 
                              className="flex items-center gap-2"
                              data-testid={`write-outreach-badges-container-${index}`}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.15 + 0.3 }}
                              >
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  data-testid={`write-outreach-badge-tone-${index}`}
                                >
                                  {variation.tone || 'Professional'}
                                </Badge>
                              </motion.div>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.15 + 0.4 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  data-testid={`write-outreach-badge-version-${index}`}
                                >
                                  Version {index + 1}
                                </Badge>
                              </motion.div>
                            </div>
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.15 + 0.5 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(variation.content, index)
                                }}
                                className="h-8 px-2 relative"
                                data-testid={`write-outreach-button-copy-message-${index}`}
                              >
                                {/* Success celebration */}
                                {isCopied && selectedVariation === index && (
                                  <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.5, 0] }}
                                    transition={{ duration: 0.5 }}
                                    data-testid={`write-outreach-copy-celebration-${index}`}
                                  >
                                    {[...Array(8)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-success rounded-full"
                                        style={{
                                          left: '50%',
                                          top: '50%',
                                        }}
                                        animate={{
                                          x: [0, Math.cos(i * 45 * Math.PI / 180) * 20],
                                          y: [0, Math.sin(i * 45 * Math.PI / 180) * 20],
                                          opacity: [1, 0],
                                          scale: [1, 0],
                                        }}
                                        transition={{
                                          duration: 0.5,
                                          ease: "easeOut"
                                        }}
                                        data-testid={`write-outreach-copy-particle-${index}-${i}`}
                                      />
                                    ))}
                                  </motion.div>
                                )}
                                
                                <AnimatePresence mode="wait">
                                  {isCopied && selectedVariation === index ? (
                                    <motion.div
                                      key="check"
                                      initial={{ scale: 0, rotate: -90 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      exit={{ scale: 0, rotate: 90 }}
                                      transition={{ type: "spring", stiffness: 500 }}
                                      data-testid={`write-outreach-icon-check-${index}`}
                                    >
                                      <Check className="h-4 w-4 text-success" />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="copy"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      data-testid={`write-outreach-icon-copy-${index}`}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </motion.div>
                          </div>
                          
                          {/* Message content */}
                          <div 
                            className="text-sm whitespace-pre-wrap"
                            data-testid={`write-outreach-text-message-content-${index}`}
                          >
                            {variation.content}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div 
                className="flex gap-3 pt-4 border-t"
                data-testid="write-outreach-container-action-buttons"
              >
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex-1"
                  data-testid="write-outreach-button-regenerate-trigger"
                >
                  <RefreshCw 
                    className="mr-2 h-4 w-4" 
                    data-testid="write-outreach-icon-regenerate"
                  />
                  <span data-testid="write-outreach-text-regenerate">Regenerate</span>
                </Button>
                <Button
                  variant="default"
                  onClick={downloadMessage}
                  disabled={selectedVariation === null}
                  className="flex-1"
                  data-testid="write-outreach-button-download-trigger"
                >
                  <Download 
                    className="mr-2 h-4 w-4" 
                    data-testid="write-outreach-icon-download"
                  />
                  <span data-testid="write-outreach-text-download">Download Selected</span>
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center h-[400px] text-center space-y-4"
              data-testid="write-outreach-container-no-messages"
            >
              <div 
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                data-testid="write-outreach-icon-container-no-messages"
              >
                <Mail 
                  className="h-10 w-10 text-primary" 
                  data-testid="write-outreach-icon-mail-placeholder"
                />
              </div>
              <div 
                className="space-y-2"
                data-testid="write-outreach-text-container-no-messages"
              >
                <h3 
                  className="text-lg font-semibold"
                  data-testid="write-outreach-title-no-messages"
                >
                  No Messages Yet
                </h3>
                <p 
                  className="text-sm text-muted-foreground max-w-sm"
                  data-testid="write-outreach-description-no-messages"
                >
                  Fill in the recipient details and click generate to create personalized outreach messages
                </p>
              </div>
            </div>
          )}
      </div>
    </motion.div>
  )
}