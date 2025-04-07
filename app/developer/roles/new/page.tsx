"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RoleFormData {
  title: string
  companyId: string
  description: string
  requirements: string
  location: string
  salary: string
  type: string
}

export default function NewRolePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RoleFormData>({
    title: "",
    companyId: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    type: ""
  })

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split(",").map(req => req.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create role")
      }

      toast({
        title: "Success",
        description: "Role created successfully",
      })

      router.push("/developer/roles")
    } catch (error) {
      console.error("Error creating role:", error)
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Roles
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Role Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              <Input
                id="companyId"
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                placeholder="Company ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role and its responsibilities..."
                required
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (comma-separated)</Label>
              <Input
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="e.g. 5+ years of experience, React, TypeScript"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Remote, New York, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g. $100,000 - $150,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 