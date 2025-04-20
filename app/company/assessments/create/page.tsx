"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FileText, ArrowLeft, Plus, X, Clock, Loader2, CheckCircle } from "lucide-react"
import { QuestionTemplateSelector } from "@/components/question-template-selector"

export default function CreateAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Initial assessment data
  const [assessment, setAssessment] = useState({
    title: "",
    description: "",
    instructions: "",
    timeLimit: 60,
    difficulty: "intermediate",
    skills: [],
    requiresTechnicalTest: true,
    status: "draft",
    questions: [],
  })

  const [newSkill, setNewSkill] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAssessment((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setAssessment((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name, checked) => {
    setAssessment((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !assessment.skills.includes(newSkill.trim())) {
      setAssessment((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setAssessment((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleQuestionChange = (id, field, value) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    }))
  }

  const addQuestion = () => {
    const newId = `q${assessment.questions.length + 1}`
    setAssessment((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: newId,
          title: "New Question",
          description: "Enter question description here",
          difficulty: "intermediate",
          timeEstimate: 15,
        },
      ],
    }))
  }

  const removeQuestion = (id) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }))
  }

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
          timeEstimate: template.timeEstimate,
        },
      ],
    }))

    toast({
      title: "Template Added",
      description: `Added "${template.title}" to your assessment`,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would send to an API
      // For demo, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Assessment Created",
        description: "Your assessment has been created successfully",
      })

      // Redirect to the assessment dashboard
      setTimeout(() => {
        router.push("/company/assessments")
      }, 500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
            <Link href="/company/assessments" className="text-sm font-medium underline underline-offset-4">
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
          <Button variant="outline" size="sm" onClick={() => router.push("/company/assessments")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Assessments
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Assessment</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 animate-fade-in">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
                    <CardDescription>Define the basic information for your technical assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={assessment.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Frontend Developer Assessment"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={assessment.description}
                        onChange={handleInputChange}
                        placeholder="Describe the purpose and expectations of this assessment"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        value={assessment.instructions}
                        onChange={handleInputChange}
                        placeholder="Provide detailed instructions for candidates taking this assessment"
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          name="timeLimit"
                          type="number"
                          min="5"
                          max="240"
                          value={assessment.timeLimit}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={assessment.difficulty}
                          onValueChange={(value) => handleSelectChange("difficulty", value)}
                        >
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
                    </div>

                    <div className="space-y-2">
                      <Label>Skills Required</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {assessment.skills.map((skill, index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-1 rounded-full hover:bg-muted"
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {skill}</span>
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6 animate-fade-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Assessment Questions</CardTitle>
                      <CardDescription>Add questions to test candidate skills</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <QuestionTemplateSelector onSelectTemplate={handleTemplateSelect} />
                      <Button type="button" onClick={addQuestion} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {assessment.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        className="border rounded-lg p-4 space-y-4 hover-lift"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Question {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-title`}>Title</Label>
                          <Input
                            id={`question-${question.id}-title`}
                            value={question.title}
                            onChange={(e) => handleQuestionChange(question.id, "title", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-description`}>Description</Label>
                          <Textarea
                            id={`question-${question.id}-description`}
                            value={question.description}
                            onChange={(e) => handleQuestionChange(question.id, "description", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`question-${question.id}-difficulty`}>Difficulty</Label>
                            <Select
                              value={question.difficulty}
                              onValueChange={(value) => handleQuestionChange(question.id, "difficulty", value)}
                            >
                              <SelectTrigger id={`question-${question.id}-difficulty`}>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`question-${question.id}-time`}>Time Estimate (minutes)</Label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`question-${question.id}-time`}
                                type="number"
                                min="5"
                                max="60"
                                value={question.timeEstimate}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    question.id,
                                    "timeEstimate",
                                    Number.parseInt(e.target.value, 10) || 5,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {assessment.questions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">No questions added yet</p>
                        <Button type="button" onClick={addQuestion}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Your First Question
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 animate-fade-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>Assessment Settings</CardTitle>
                    <CardDescription>Configure how your assessment will be administered</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="requiresTechnicalTest">Require Technical Test</Label>
                        <p className="text-sm text-muted-foreground">
                          Candidates must complete a technical test before applying
                        </p>
                      </div>
                      <Switch
                        id="requiresTechnicalTest"
                        checked={assessment.requiresTechnicalTest}
                        onCheckedChange={(checked) => handleSwitchChange("requiresTechnicalTest", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Assessment Status</Label>
                      <Select value={assessment.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assessment.status === "draft"
                          ? "Draft assessments are not visible to candidates"
                          : "Active assessments are visible to candidates"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input id="passingScore" type="number" min="1" max="100" defaultValue="70" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                      <Select defaultValue="1">
                        <SelectTrigger id="maxAttempts">
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
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div
            className="flex justify-end gap-4 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button type="button" variant="outline" onClick={() => router.push("/company/assessments")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Assessment
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </main>
    </div>
  )
}

