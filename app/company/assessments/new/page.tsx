"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ArrowLeft, Plus, Trash2, Save, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PageTransition } from "@/components/ui/page-transition"
import { QuestionTemplateSelector } from "@/components/question-template-selector"
import { motion } from "framer-motion"

export default function NewAssessmentPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("coding")

  // Mock assessment data for the form
  const [assessment, setAssessment] = useState({
    title: "",
    description: "",
    difficulty: "intermediate",
    duration: 60,
    skills: ["JavaScript", "React", "TypeScript"],
    questions: [
      {
        id: "q1",
        title: "Implement a Binary Search Tree",
        description: "Create a binary search tree implementation with insert, search, and delete operations.",
        difficulty: "intermediate",
        points: 20,
      },
    ],
  })

  const handleTemplateSelect = (template) => {
    const newId = `q${assessment.questions.length + 1}`
    setAssessment((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: newId,
          title: template.title,
          description: template.description,
          difficulty: template.difficulty,
          points: template.difficulty === "easy" ? 10 : template.difficulty === "intermediate" ? 20 : 30,
        },
      ],
    }))

    toast({
      title: "Template Added",
      description: `Added "${template.title}" to your assessment`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Assessment Created",
      description: "Your new assessment has been created successfully.",
      variant: "default",
    })

    setIsSubmitting(false)
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
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
              <Link href="/company/candidates" className="text-sm font-medium hover:underline underline-offset-4">
                Candidates
              </Link>
              <Link href="/company/settings" className="text-sm font-medium hover:underline underline-offset-4">
                Settings
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                RightHub
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6 md:py-10 px-4 md:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/company/assessments">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Assessments
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Create New Assessment</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-hover"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Details</CardTitle>
                      <CardDescription>Define the basic information for your technical assessment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Assessment Title</Label>
                        <Input id="title" placeholder="e.g., Senior Frontend Developer Assessment" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the purpose and expectations of this assessment"
                          rows={4}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select required>
                            <SelectTrigger id="difficulty">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Time Limit (minutes)</Label>
                          <Input id="duration" type="number" placeholder="60" min="15" max="180" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Required Skills</Label>
                        <div className="flex flex-wrap gap-2 border rounded-md p-2">
                          {assessment.skills.map((skill, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.1 }}
                              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                            >
                              {skill}
                              <button type="button" className="text-primary/70 hover:text-primary">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                          <Input className="flex-1 min-w-[150px] border-0 h-8" placeholder="Add a skill..." />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="coding">Coding Challenges</TabsTrigger>
                      <TabsTrigger value="multiple-choice">Multiple Choice</TabsTrigger>
                      <TabsTrigger value="project">Project Task</TabsTrigger>
                    </TabsList>
                    <TabsContent value="coding" className="mt-4">
                      <Card className="card-hover">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Coding Challenges</CardTitle>
                            <CardDescription>
                              Add programming challenges that test specific coding skills.
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <QuestionTemplateSelector onSelectTemplate={handleTemplateSelect} />
                            <Button type="button" size="sm" className="gap-1">
                              <Plus className="h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {assessment.questions.map((question, index) => (
                            <motion.div
                              key={question.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="border rounded-lg p-4 space-y-4 hover-lift"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Challenge #{index + 1}</h3>
                                  <p className="text-sm text-muted-foreground">Algorithm Implementation</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`challenge-title-${index}`}>Title</Label>
                                <Input id={`challenge-title-${index}`} defaultValue={question.title} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`challenge-description-${index}`}>Description</Label>
                                <Textarea
                                  id={`challenge-description-${index}`}
                                  defaultValue={question.description}
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`challenge-difficulty-${index}`}>Difficulty</Label>
                                  <Select defaultValue={question.difficulty}>
                                    <SelectTrigger id={`challenge-difficulty-${index}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="beginner">Beginner</SelectItem>
                                      <SelectItem value="intermediate">Intermediate</SelectItem>
                                      <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`challenge-points-${index}`}>Points</Label>
                                  <Input
                                    id={`challenge-points-${index}`}
                                    type="number"
                                    defaultValue={question.points}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          <Button className="w-full gap-1" variant="outline" type="button">
                            <Plus className="h-4 w-4" />
                            Add Another Coding Challenge
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="multiple-choice" className="mt-4">
                      <Card className="card-hover">
                        <CardHeader>
                          <CardTitle>Multiple Choice Questions</CardTitle>
                          <CardDescription>
                            Add multiple choice questions to test theoretical knowledge.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
                            <div>
                              <p className="mb-2">No multiple choice questions added yet</p>
                              <Button type="button" className="gap-1">
                                <Plus className="h-4 w-4" />
                                Add Multiple Choice Question
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="project" className="mt-4">
                      <Card className="card-hover">
                        <CardHeader>
                          <CardTitle>Project Task</CardTitle>
                          <CardDescription>
                            Define a comprehensive project task to assess practical skills.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-title">Project Title</Label>
                            <Input id="project-title" placeholder="e.g., Build a React Todo App" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-description">Project Description</Label>
                            <Textarea
                              id="project-description"
                              placeholder="Describe the project requirements and expectations in detail"
                              rows={6}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-deliverables">Deliverables</Label>
                            <Textarea
                              id="project-deliverables"
                              placeholder="List the specific deliverables expected from the candidate"
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-evaluation">Evaluation Criteria</Label>
                            <Textarea
                              id="project-evaluation"
                              placeholder="Define how the project will be evaluated"
                              rows={4}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-6"
              >
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>Assessment Settings</CardTitle>
                    <CardDescription>Configure how your assessment will be administered.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input id="passing-score" type="number" defaultValue="70" min="1" max="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-attempts">Maximum Attempts</Label>
                      <Select defaultValue="1">
                        <SelectTrigger id="max-attempts">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access-type">Access Type</Label>
                      <Select defaultValue="invite">
                        <SelectTrigger id="access-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invite">Invitation Only</SelectItem>
                          <SelectItem value="public">Public Link</SelectItem>
                          <SelectItem value="platform">Platform Matching</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Link Expiration</Label>
                      <Select defaultValue="7">
                        <SelectTrigger id="expiration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>Assessment Preview</CardTitle>
                    <CardDescription>Review your assessment before creating it.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Senior Frontend Developer Assessment</h3>
                            <p className="text-xs text-muted-foreground">Intermediate • 60 min</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          This assessment evaluates advanced React skills, state management, and responsive design
                          implementation.
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Challenges:</span>
                        <span className="font-medium">{assessment.questions.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Points:</span>
                        <span className="font-medium">
                          {assessment.questions.reduce((total, q) => total + (q.points || 0), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Passing Score:</span>
                        <span className="font-medium">70%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              className="flex justify-end gap-4 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button variant="outline" type="button" className="gap-1">
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Assessment
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </main>
      </div>
    </PageTransition>
  )
}

