"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Mail, PenTool, ArrowRight } from "lucide-react"
import { CVOptimizer } from "./components/cv-optimizer"
import { CoverLetterCreator } from "./components/cover-letter-creator"
import { OutreachMessageGenerator } from "./components/outreach-message-generator"
import { RoleContextCard } from "./components/role-context-card"
import { useToast } from "@/components/ui/use-toast"

interface Role {
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

export default function WritingHelpPage() {
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "outreach">("cv")
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get("roleId")
  const { toast } = useToast()

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        toast({
          title: "No role selected",
          description: "Please select a role to create application materials for.",
          variant: "destructive",
        })
        router.push("/developer/roles")
        return
      }

      try {
        const response = await fetch(`/api/roles/${roleId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch role")
        }
        const data = await response.json()
        console.log("Fetched role data:", data)
        setRole(data)
      } catch (error) {
        console.error("Error fetching role:", error)
        toast({
          title: "Error",
          description: "Failed to load role details. Please try again.",
          variant: "destructive",
        })
        router.push("/developer/roles")
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [roleId, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!role) {
    return null
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col space-y-2 mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Writing Help</h1>
        <p className="text-muted-foreground">
          Create compelling application materials with AI-powered assistance
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Application Materials</CardTitle>
              <CardDescription>Choose the type of document you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "cv" | "cover-letter" | "outreach")}
                className="w-full"
                defaultValue="cv"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
                  <TabsTrigger value="cv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CV Optimization
                  </TabsTrigger>
                  <TabsTrigger value="cover-letter" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="outreach" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Outreach Message
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="cv" className="m-0">
                    <CVOptimizer role={role} />
                  </TabsContent>

                  <TabsContent value="cover-letter" className="m-0">
                    <CoverLetterCreator role={role} />
                  </TabsContent>

                  <TabsContent value="outreach" className="m-0">
                    <OutreachMessageGenerator role={role} />
                  </TabsContent>
                </div>
              </Tabs>

              {/* Progress Indicator */}
              <div className="flex justify-center items-center gap-2 pt-4">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    activeTab === "cv"
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    activeTab === "cover-letter"
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    activeTab === "outreach"
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <RoleContextCard role={role} activeDocument={activeTab} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex justify-end mt-6"
      >
        <Button
          onClick={() => router.push("/developer/roles")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          Back to Roles <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
} 