"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Copy, RefreshCw, Shuffle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Role } from "@/types"

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
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Outreach Message Generator</CardTitle>
          <CardDescription>
            Create personalized outreach messages for different platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Recipient Information</Label>
              <Textarea
                placeholder="Add details about the person you're reaching out to..."
                value={recipientInfo}
                onChange={(e) => setRecipientInfo(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Context</Label>
              <Textarea
                placeholder="What's the purpose of your outreach? Add any specific points you'd like to mention..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !recipientInfo || !context}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Generate Variations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Message Variations</CardTitle>
          <CardDescription>
            Choose from different message variations and copy to clipboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variations.length > 0 ? (
            <div className="space-y-4">
              {variations.map((variation, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{variation.platform}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(variation.content)}
                        >
                          <Copy className="h-4 w-4" />
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
            <div className="flex items-center justify-center h-[400px] border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                Your message variations will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 