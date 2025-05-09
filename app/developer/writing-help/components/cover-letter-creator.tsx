"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { PlusCircle, Trash2, ArrowRight, Download, RefreshCw, Loader2, Copy, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InternalProfile, InternalAchievement } from "@/types/types"
import { Role } from "@/types/role"

interface CoverLetterCreatorProps {
  role: Role
  generationTrigger?: number
  onGenerationComplete?: (roleId: string, success: boolean) => void
}

export function CoverLetterCreator({ role, generationTrigger, onGenerationComplete }: CoverLetterCreatorProps) {
  const { data: session } = useSession()
  const [developerProfile, setDeveloperProfile] = useState<InternalProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [jobSource, setJobSource] = useState<string>("")
  const [companyAttractionPoints, setCompanyAttractionPoints] = useState<string[]>([
    "Innovative products in the tech space",
    "Strong company culture and values"
  ])
  const [newAchievementTitle, setNewAchievementTitle] = useState<string>("")
  const [newAttractionPoint, setNewAttractionPoint] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
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
    setCompanyAttractionPoints([...companyAttractionPoints, newAttractionPoint])
    setNewAttractionPoint('')
  }

  const handleRemoveAttractionPoint = (index: number) => {
    const updatedPoints = [...companyAttractionPoints]
    updatedPoints.splice(index, 1)
    setCompanyAttractionPoints(updatedPoints)
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
      setGeneratedLetter(data.letter)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Customize & Generate</CardTitle>
            <CardDescription className="text-sm">
              Provide additional context for your cover letter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div>
              <Label htmlFor="jobSource" className="text-sm">How did you find this job? (Optional)</Label>
              <Input
                id="jobSource"
                placeholder="e.g., LinkedIn, Company Website, Referral"
                value={jobSource}
                onChange={(e) => setJobSource(e.target.value)}
                className="mt-1.5 h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">Your Key Achievements</Label>
              <ScrollArea className="h-32 rounded-md border p-2 bg-white dark:bg-gray-800">
                {(developerProfile?.achievements || []).map((achievement: InternalAchievement) => (
                  <div key={achievement.id} className="flex items-center justify-between mb-1.5 gap-2">
                    <p className="text-sm flex-1 pr-2 truncate" title={achievement.title}>{achievement.title}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => handleRemoveAchievement(achievement.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Add a key achievement..."
                  value={newAchievementTitle}
                  onChange={(e) => setNewAchievementTitle(e.target.value)}
                  className="text-sm h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAchievement}
                  className="h-8 px-2"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Why This Company?</Label>
              <ScrollArea className="h-32 rounded-md border p-2 bg-white dark:bg-gray-800">
                {companyAttractionPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between mb-1.5 gap-2">
                    <p className="text-sm flex-1 pr-2">{point}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => handleRemoveAttractionPoint(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Add what attracts you..."
                  value={newAttractionPoint}
                  onChange={(e) => setNewAttractionPoint(e.target.value)}
                  className="text-sm h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttractionPoint}
                  className="h-8 px-2"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !developerProfile}
              className="w-full h-8 text-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                  {generatedLetter ? 'Re-generate' : 'Generate Cover Letter'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Generated Cover Letter</CardTitle>
            <CardDescription className="text-sm">
              Review and export your generated cover letter.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Textarea
              value={generatedLetter}
              readOnly
              placeholder="Your generated cover letter will appear here..."
              className="min-h-[400px] text-sm bg-white dark:bg-gray-800"
            />
            {generatedLetter && (
              <div className="flex gap-2 mt-1.5">
                <Button
                  onClick={handleExport}
                  className="flex-1 h-8 text-sm"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export Cover Letter
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 h-8 text-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 