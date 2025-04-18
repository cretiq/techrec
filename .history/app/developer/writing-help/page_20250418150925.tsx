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
import { useSession } from "next-auth/react"
import { Role } from "@/types/role"

export default function WritingHelpPage() {
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "outreach">("cv")
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get("roleId")
  const passedRoleData = searchParams.get("roleData")
  const { toast } = useToast()
  const { data: session, status } = useSession()

  useEffect(() => {
    const processRole = async () => {
      setLoading(true)
      if (status === 'unauthenticated') {
        router.push('/auth/signin?callbackUrl=/developer/writing-help' + (roleId ? `?roleId=${roleId}` : ''))
        return
      }

      if (passedRoleData) {
        try {
          const decodedRole = JSON.parse(decodeURIComponent(passedRoleData))
          console.log("Using passed role data:", decodedRole)
          setRole(decodedRole as Role)
          setLoading(false)
        } catch (error) {
          console.error("Error parsing passed role data:", error)
          toast({ title: "Error", description: "Could not load role data. Please try again.", variant: "destructive" })
          router.push("/developer/roles/search")
          setLoading(false)
        }
        return
      }

      if (!roleId) {
        toast({
          title: "No role specified",
          description: "Please select a role first or provide role data.",
          variant: "destructive",
        })
        router.push("/developer/roles/search")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/roles/${roleId}`)
        if (!response.ok) {
          const customResponse = await fetch(`/api/custom-roles/${roleId}`)
          if (!customResponse.ok) {
            throw new Error(`Failed to fetch role (Standard: ${response.status}, Custom: ${customResponse.status})`)
          }
          const data = await customResponse.json()
          console.log("Fetched custom role data:", data)
          setRole(data)
        } else {
          const data = await response.json()
          console.log("Fetched standard role data:", data)
          setRole(data)
        }
      } catch (error) {
        console.error("Error fetching role:", error)
        toast({
          title: "Error",
          description: "Failed to load role details. Please try again or go back.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      processRole()
    }
  }, [roleId, passedRoleData, router, toast, status])

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