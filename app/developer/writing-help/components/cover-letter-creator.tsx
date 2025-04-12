"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Download, RefreshCw } from "lucide-react"

interface CoverLetterOptions {
  tone: string
  length: number
}

interface CoverLetterCreatorProps {
  role: {
    id: string
    title: string
    description: string
    requirements: string[]
    skills: {
      id: string
      name: string
      description: string
    }[]
    company: {
      id: string
      name: string
    }
    location: string
    salary: string
    type: string
    remote: boolean
    visaSponsorship: boolean
  }
}

export function CoverLetterCreator({ role }: CoverLetterCreatorProps) {
  const [options, setOptions] = useState<CoverLetterOptions>({
    tone: "professional",
    length: 350,
  })
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: role.description,
          companyInfo: `${role.company.name} - ${role.location}${role.remote ? ' (Remote)' : ''}`,
          options: {
            ...options,
            technologies: role.skills.map(skill => skill.name),
            achievements: [], // These can be added later if needed
            focusPoints: role.requirements,
          },
        }),
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
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Settings</CardTitle>
          <CardDescription>
            Customize your cover letter generation preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Tone</Label>
              <Select
                value={options.tone}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, tone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Length (words)</Label>
              <Slider
                value={[options.length]}
                onValueChange={([value]) =>
                  setOptions((prev) => ({ ...prev, length: value }))
                }
                min={250}
                max={500}
                step={50}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Target: {options.length} words
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Generate Letter
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Cover Letter</CardTitle>
          <CardDescription>
            Review and edit your generated cover letter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedLetter ? (
            <>
              <Textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="min-h-[400px]"
              />
              <Button onClick={handleExport} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Cover Letter
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] border rounded-lg border-dashed">
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