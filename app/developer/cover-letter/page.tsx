"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Copy, Mail, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/models/Company"
import { Profile } from "@/lib/models/Profile"

const TypewriterText = ({ text, isSubject = false }: { text: string, isSubject?: boolean }) => {
  const [displayText, setDisplayText] = useState("")
  const [buffer, setBuffer] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [fadeChars, setFadeChars] = useState<number[]>([])

  // Update buffer when new text comes in
  useEffect(() => {
    setBuffer(text)
    if (!isTyping) {
      setIsTyping(true)
    }
  }, [text])

  // Handle the typing animation
  useEffect(() => {
    if (!isTyping || buffer === displayText) {
      setIsTyping(false)
      return
    }

    const getTypingDelay = () => {
      const char = buffer[displayText.length]
      // Faster typing for spaces and common punctuation
      if ([' ', ',', '.', '!', '?'].includes(char)) {
        return 10
      }
      // Random delay between 20-35ms for natural feel
      return Math.random() * 15 + 20
    }

    const timer = setTimeout(() => {
      if (displayText.length < buffer.length) {
        setDisplayText(buffer.slice(0, displayText.length + 1))
        setFadeChars(prev => [...prev, displayText.length])
        
        // Remove fade class after animation
        setTimeout(() => {
          setFadeChars(prev => prev.filter(i => i !== displayText.length))
        }, 500)
      }
    }, getTypingDelay())

    return () => clearTimeout(timer)
  }, [buffer, displayText, isTyping])

  return (
    <div className={cn(
      "relative whitespace-pre-wrap font-mono text-sm",
      isSubject && "border-b pb-2 mb-3"
    )}>
      {displayText.split('').map((char, index) => (
        <span
          key={index}
          className={cn(
            "transition-opacity duration-500",
            fadeChars.includes(index) ? "opacity-0" : "opacity-100"
          )}
        >
          {char}
        </span>
      ))}
      {isTyping && !isSubject && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-muted/50" />
      )}
    </div>
  )
}

export default function CoverLetterPage() {
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState("")
  const [letterType, setLetterType] = useState<"email" | "message">("email")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const companiesRes = await fetch('/api/companies')
        const companiesData = await companiesRes.json()
        setCompanies(companiesData)

        // Fetch first profile (in a real app, you'd fetch the current user's profile)
        const profilesRes = await fetch('/api/profiles')
        const profilesData = await profilesRes.json()
        if (profilesData.length > 0) {
          setProfile(profilesData[0])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleGenerateLetter = async () => {
    if (!selectedCompany || !profile) {
      toast({
        title: "Error",
        description: "Please select a company and ensure your profile is loaded",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedLetter("")
    setEmailSubject("")
    
    try {
      const company = companies.find(c => c._id === selectedCompany)
      if (!company) return

      const response = await fetch("/api/generate-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: company.name,
          role: company.role,
          description: company.description,
          skills: company.skills,
          profile,
          letterType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate letter")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let accumulatedText = ""
      let isParsingSubject = letterType === "email"
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.trim() === "") continue
          try {
            const { delta } = JSON.parse(line)
            if (delta) {
              accumulatedText += delta
              
              if (letterType === "email") {
                // Check for subject line marker
                const subjectEndIndex = accumulatedText.indexOf("\n")
                if (subjectEndIndex !== -1 && isParsingSubject) {
                  setEmailSubject(accumulatedText.slice(0, subjectEndIndex))
                  setGeneratedLetter(accumulatedText.slice(subjectEndIndex + 1))
                  isParsingSubject = false
                } else if (isParsingSubject) {
                  setEmailSubject(accumulatedText)
                } else {
                  setGeneratedLetter(accumulatedText)
                }
              } else {
                setGeneratedLetter(accumulatedText)
              }
            }
          } catch (e) {
            console.error("Error parsing JSON:", e)
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to generate letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    const textToCopy = letterType === "email" 
      ? `Subject: ${emailSubject}\n\n${generatedLetter}`
      : generatedLetter
    
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: "Copied to clipboard",
      description: "The cover letter has been copied to your clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Profile Found</h1>
          <p className="text-muted-foreground">Please create a profile to continue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <div className="container max-w-4xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Generate Cover Letter</h1>
              <p className="text-muted-foreground">Create a personalized cover letter for your job application</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select Company and Letter Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Company</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name} - {company.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Letter Type</Label>
                  <Tabs value={letterType} onValueChange={(value) => setLetterType(value as "email" | "message")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="message">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Button 
                  onClick={handleGenerateLetter} 
                  disabled={isGenerating || !selectedCompany}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </Button>
              </CardContent>
            </Card>

            {(generatedLetter || isGenerating) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Cover Letter</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative min-h-[300px] p-4 rounded-md border bg-muted/50 overflow-hidden">
                    {letterType === "email" && emailSubject && (
                      <>
                        <div className="mb-2 text-xs text-muted-foreground">Subject:</div>
                        <TypewriterText text={emailSubject} isSubject={true} />
                      </>
                    )}
                    <TypewriterText text={generatedLetter} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 