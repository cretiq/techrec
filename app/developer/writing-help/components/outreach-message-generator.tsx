"use client"

import { useState } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { Textarea } from "@/components/ui-daisy/textarea"
import {  Input  } from '@/components/ui-daisy/input'
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from '@/components/ui-daisy/select'
import { ArrowRight, Copy, RefreshCw, Shuffle } from "lucide-react"
import {  Badge  } from '@/components/ui-daisy/badge'
import { Role } from "@/types/role"
import { Slider } from "@/components/ui/slider"

interface MessageVariation {
  content: string
  platform: string
}

interface OutreachMessageGeneratorProps {
  role: Role
}

export function OutreachMessageGenerator({ role }: OutreachMessageGeneratorProps) {
  const [recipientInfo, setRecipientInfo] = useState("")
  const [context, setContext] = useState("")
  const [platform, setPlatform] = useState("linkedin")
  const [variations, setVariations] = useState<MessageVariation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!recipientInfo || !context) {
      toast({
        title: "Missing Information",
        description: "Please provide recipient information and context.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientInfo,
          context,
          platform,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate messages")
      }

      const data = await response.json()
      setVariations(data.variations)
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Message has been copied to your clipboard.",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Outreach Message Generator</CardTitle>
          <CardDescription className="text-sm">
            Create personalized outreach messages for different platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Recipient Information</Label>
              <Textarea
                placeholder="Add details about the person you're reaching out to..."
                value={recipientInfo}
                onChange={(e) => setRecipientInfo(e.target.value)}
                className="mt-1.5 min-h-[100px] text-sm bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <Label className="text-sm">Context</Label>
              <Textarea
                placeholder="What's the purpose of your outreach? Add any specific points you'd like to mention..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1.5 min-h-[100px] text-sm bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <Label className="text-sm">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-8 text-sm mt-1.5">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin" className="text-sm">LinkedIn</SelectItem>
                  <SelectItem value="email" className="text-sm">Email</SelectItem>
                  <SelectItem value="twitter" className="text-sm">Twitter</SelectItem>
                  <SelectItem value="github" className="text-sm">GitHub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !recipientInfo || !context}
              className="w-full h-8 text-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shuffle className="mr-1.5 h-3.5 w-3.5" />
                  Generate Variations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Message Variations</CardTitle>
          <CardDescription className="text-sm">
            Choose from different message variations and copy to clipboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {variations.length > 0 ? (
            <div className="space-y-3">
              {variations.map((variation, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs h-5">{variation.platform}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(variation.content)}
                          className="h-7"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {variation.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] border rounded-lg border-dashed bg-white/50 dark:bg-gray-800/50">
              <p className="text-muted-foreground text-sm">
                Your message variations will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 