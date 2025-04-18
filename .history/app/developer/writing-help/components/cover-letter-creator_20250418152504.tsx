"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { PlusCircle, Trash2, ArrowRight, Download, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Role } from "@/types/role"
import { DeveloperProfile } from "@/types/developer"
interface CoverLetterCreatorProps {
  role: Role
}

export function CoverLetterCreator({ role }: CoverLetterCreatorProps) {
  const { data: session } = useSession()
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [jobSource, setJobSource] = useState<string>("")
  const [companyAttractionPoints, setCompanyAttractionPoints] = useState<string[]>([
    "Innovative products in the tech space",
    "Strong company culture and values"
  ])
  const [newAchievement, setNewAchievement] = useState<string>("")
  const [newAttractionPoint, setNewAttractionPoint] = useState<string>("")
  const [totalExperience, setTotalExperience] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developer/me')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data: DeveloperProfile = await response.json()
        setDeveloperProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleAddAchievement = () => {
    if (newAchievement.trim() === '') return
    if (developerProfile) {
      setDeveloperProfile({
        ...developerProfile,
        achievements: [...developerProfile.achievements, {
          id: Date.now().toString(),
          title: newAchievement,
          description: '',
          date: '',
          url: '',
          issuer: ''
        }]
      })
      setNewAchievement('')
    }
  }

  const handleRemoveAchievement = (index: number) => {
    if (developerProfile) {
      const updatedAchievements = [...developerProfile.achievements]
      updatedAchievements.splice(index, 1)
      setDeveloperProfile({
        ...developerProfile,
        achievements: updatedAchievements
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
        description: "Please wait while we load your profile information",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Updated to match the API route's new interface
      const requestData = {
        developerProfile: {
          ...developerProfile,
          totalExperience
        },
        roleInfo: {
          title: role.title,
          description: role.description,
          requirements: role.requirements,
          skills: role.skills.map(skill => skill.name),
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

      console.log(JSON.stringify(requestData, null, 2))

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate cover letter")
      }

      const data = await response.json()
      setGeneratedLetter(data.letter)
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your cover letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>
              Your professional information for the cover letter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Total Years of Experience</Label>
              <Input
                placeholder="e.g., 5+ years in full-stack development"
                value={totalExperience}
                onChange={(e) => setTotalExperience(e.target.value)}
              />
            </div>
            
            <div>
              <Label>How did you find this job?</Label>
              <Input
                placeholder="e.g., LinkedIn, Company Website, Referral"
                value={jobSource}
                onChange={(e) => setJobSource(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Your Key Achievements</Label>
              <ScrollArea className="h-32 rounded-md border p-2">
                {developerProfile?.achievements.map((achievement, index) => (
                  <div key={achievement.id} className="flex items-center justify-between mb-2">
                    <p className="text-sm flex-1 pr-2">{achievement.title}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveAchievement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a quantifiable achievement"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAchievement()}
                />
                <Button onClick={handleAddAchievement} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Interest</CardTitle>
            <CardDescription>
              Why you're interested in this company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Attraction Points</Label>
              <ScrollArea className="h-32 rounded-md border p-2">
                {companyAttractionPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <p className="text-sm flex-1 pr-2">{point}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveAttractionPoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a reason you're attracted to this company"
                  value={newAttractionPoint}
                  onChange={(e) => setNewAttractionPoint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttractionPoint()}
                />
                <Button onClick={handleAddAttractionPoint} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !developerProfile}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Generated Cover Letter</CardTitle>
          <CardDescription>
            Review and edit your generated cover letter
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-4">
          {generatedLetter ? (
            <>
              <Textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="min-h-[500px] flex-grow"
              />
              <Button onClick={handleExport} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Cover Letter
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center flex-grow border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                Your generated cover letter will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 