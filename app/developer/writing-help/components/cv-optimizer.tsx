"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, FileText, Upload, RefreshCw, Download, Check, X } from "lucide-react"
import { Role } from "@/types"

interface Suggestion {
  original: string
  suggested: string
  accepted: boolean
}

interface CVOptimizerProps {
  role: Role
}

export function CVOptimizer({ role }: CVOptimizerProps) {
  const [originalCV, setOriginalCV] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === "string") {
          setOriginalCV(text)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleOptimize = async () => {
    if (!originalCV || !jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide both your CV and the job description.",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv: originalCV,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize CV")
      }

      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "There was an error optimizing your CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const toggleSuggestion = (index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, accepted: !s.accepted } : s
      )
    )
  }

  const getOptimizedCV = () => {
    let optimizedCV = originalCV
    suggestions
      .filter((s) => s.accepted)
      .forEach((s) => {
        optimizedCV = optimizedCV.replace(s.original, s.suggested)
      })
    return optimizedCV
  }

  const handleExport = () => {
    const optimizedCV = getOptimizedCV()
    const blob = new Blob([optimizedCV], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "optimized-cv.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CV Optimizer</CardTitle>
          <CardDescription>
            Upload your CV and job description to receive AI-powered optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Your CV</Label>
              <div className="mt-2 grid gap-4">
                <Textarea
                  placeholder="Paste your CV content here..."
                  value={originalCV}
                  onChange={(e) => setOriginalCV(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={() => setOriginalCV("")}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Job Description</Label>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-2 min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || !originalCV || !jobDescription}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Optimize CV
                </>
              )}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Suggestions</h3>
              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid gap-2">
                        <div className="text-muted-foreground line-through">
                          {suggestion.original}
                        </div>
                        <div className="font-medium">
                          {suggestion.suggested}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={suggestion.accepted ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSuggestion(index)}
                          >
                            {suggestion.accepted ? (
                              <>
                                <Check className="mr-1 h-4 w-4" />
                                Applied
                              </>
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Optimized CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 