"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft, Save, Trash2, Plus, X, Calendar, Clock, FileCheck, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

// Mock role data
const roleData = {
  id: "1",
  title: "Senior Frontend Developer",
  status: "active",
  createdAt: "2025-03-15",
  applicants: 24,
  views: 156,
  deadline: "2025-04-15",
  location: "San Francisco, CA (Remote)",
  type: "Full-time",
  salary: "$120,000 - $150,000",
  skills: ["React", "TypeScript", "CSS", "Next.js", "Redux"],
  description: `
    <p>We're looking for a Senior Frontend Developer to join our team and help build our next-generation web applications.</p>
    
    <h3>Responsibilities:</h3>
    <ul>
      <li>Develop new user-facing features using React.js</li>
      <li>Build reusable components and front-end libraries for future use</li>
      <li>Translate designs and wireframes into high-quality code</li>
      <li>Optimize components for maximum performance across a vast array of web-capable devices and browsers</li>
      <li>Collaborate with the design team to implement UI/UX best practices</li>
    </ul>
    
    <h3>Requirements:</h3>
    <ul>
      <li>5+ years of experience in frontend development</li>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
      <li>Thorough understanding of React.js and its core principles</li>
      <li>Experience with popular React.js workflows (such as Redux)</li>
      <li>Familiarity with newer specifications of ECMAScript</li>
      <li>Experience with data structure libraries (e.g., Immutable.js)</li>
      <li>Knowledge of isomorphic React is a plus</li>
      <li>Understanding of server-side rendering</li>
    </ul>
  `,
  requiredExperience: "5+ years",
  requiresTechnicalAssessment: true,
  technicalAssessment: {
    id: "1",
    title: "Frontend Developer Technical Assessment",
  },
  assessments: [
    {
      id: "1",
      title: "Frontend Developer Technical Assessment",
      timeLimit: 90,
      questions: 5,
      difficulty: "Advanced",
      skills: ["React", "TypeScript", "CSS", "Next.js"],
      description: "This assessment evaluates frontend development skills with a focus on React and TypeScript.",
    },
    {
      id: "2",
      title: "JavaScript Fundamentals Test",
      timeLimit: 60,
      questions: 20,
      difficulty: "Intermediate",
      skills: ["JavaScript", "ES6", "DOM", "Async"],
      description: "A comprehensive test of JavaScript fundamentals and modern ES6+ features.",
    },
    {
      id: "3",
      title: "CSS and UI Design Assessment",
      timeLimit: 45,
      questions: 15,
      difficulty: "Intermediate",
      skills: ["CSS", "Responsive Design", "Flexbox", "Grid"],
      description: "Tests knowledge of CSS, responsive design principles, and modern layout techniques.",
    },
  ],
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [title, setTitle] = useState(roleData.title)
  const [description, setDescription] = useState(roleData.description)
  const [location, setLocation] = useState(roleData.location)
  const [type, setType] = useState(roleData.type)
  const [salary, setSalary] = useState(roleData.salary)
  const [requiredExperience, setRequiredExperience] = useState(roleData.requiredExperience)
  const [deadline, setDeadline] = useState(new Date(roleData.deadline))
  const [skills, setSkills] = useState(roleData.skills)
  const [newSkill, setNewSkill] = useState("")
  const [requiresAssessment, setRequiresAssessment] = useState(roleData.requiresTechnicalAssessment)
  const [selectedAssessment, setSelectedAssessment] = useState(roleData.technicalAssessment?.id || "")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Role updated",
      description: "The role has been updated successfully.",
    })

    setIsSaving(false)
    router.push("/company/roles")
  }

  // Handle role deletion
  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Role deleted",
      description: "The role has been deleted successfully.",
    })

    setIsDeleting(false)
    router.push("/company/roles")
  }

  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="w-full flex justify-center">
          <div className="container max-w-6xl flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6" />
              <span>DevAssess</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/company/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                Dashboard
              </Link>
              <Link href="/company/assessments" className="text-sm font-medium hover:underline underline-offset-4">
                Assessments
              </Link>
              <Link href="/company/roles" className="text-sm font-medium underline underline-offset-4">
                Roles
              </Link>
              <Link href="/company/candidates" className="text-sm font-medium hover:underline underline-offset-4">
                Candidates
              </Link>
              <Link href="/company/settings" className="text-sm font-medium hover:underline underline-offset-4">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back to roles
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
            <p className="text-muted-foreground">Update job details and requirements</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Details</CardTitle>
                    <CardDescription>Basic information about the job role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={10}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h3&gt;)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Job Type</Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Required Experience</Label>
                        <Input
                          id="experience"
                          value={requiredExperience}
                          onChange={(e) => setRequiredExperience(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {deadline ? format(deadline, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Requirements</CardTitle>
                    <CardDescription>Define the skills required for this role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills</Label>
                      <div className="flex flex-wrap gap-2 border rounded-md p-2">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              className="text-primary/70 hover:text-primary"
                              onClick={() => removeSkill(skill)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2 flex-1 min-w-[200px]">
                          <Input
                            className="flex-1 min-w-[150px] border-0 h-8"
                            placeholder="Add a skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addSkill()
                              }
                            }}
                          />
                          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={addSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Technical Assessment</CardTitle>
                        <CardDescription>Require candidates to complete a technical assessment</CardDescription>
                      </div>
                      <Switch checked={requiresAssessment} onCheckedChange={setRequiresAssessment} />
                    </div>
                  </CardHeader>
                  {requiresAssessment && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessment">Select Assessment</Label>
                        <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                          <SelectTrigger id="assessment">
                            <SelectValue placeholder="Select an assessment" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleData.assessments.map((assessment) => (
                              <SelectItem key={assessment.id} value={assessment.id}>
                                {assessment.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedAssessment && (
                        <div className="rounded-md border p-4 bg-muted/50">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-5 w-5 text-amber-600" />
                              <h3 className="font-medium">
                                {roleData.assessments.find((a) => a.id === selectedAssessment)?.title}
                              </h3>
                            </div>
                            <p className="text-sm">
                              {roleData.assessments.find((a) => a.id === selectedAssessment)?.description}
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {roleData.assessments.find((a) => a.id === selectedAssessment)?.timeLimit} minutes
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {roleData.assessments.find((a) => a.id === selectedAssessment)?.questions} questions
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline">
                                  {roleData.assessments.find((a) => a.id === selectedAssessment)?.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Don't see the assessment you need?</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/company/assessments/new")}
                        >
                          Create New Assessment
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Status</CardTitle>
                    <CardDescription>Control the visibility of this role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue={roleData.status}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h3 className="font-medium">Active</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Role is visible to candidates and accepting applications
                      </p>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <h3 className="font-medium">Draft</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Role is not visible to candidates and saved for later
                      </p>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <h3 className="font-medium">Closed</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Role is no longer accepting applications but still visible
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Statistics</CardTitle>
                    <CardDescription>Performance metrics for this role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{format(new Date(roleData.createdAt), "PPP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span>{roleData.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicants</span>
                      <span>{roleData.applicants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <span>{Math.round((roleData.applicants / roleData.views) * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader className="text-red-600">
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription className="text-red-600/80">Irreversible actions for this role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Role
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

