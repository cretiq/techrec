"use client"

import { useState, useEffect } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle2, ArrowRight, ArrowLeft, Save, User } from "lucide-react"
import { TimerButton, WarningButton, SubmitSolutionButton } from "@/components/buttons"
import { CodeEditor, type TestResult } from "@/components/code-editor"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  // This would be fetched from the database based on the assessment ID
  const assessment = {
    id: params.id,
    title: "Senior Frontend Developer Assessment",
    company: "TechCorp Inc.",
    timeLimit: 90, // minutes
    questions: [
      {
        id: "q1",
        type: "coding",
        title: "Implement a Binary Search Tree",
        description: "Create a binary search tree implementation with insert, search, and delete operations.",
        difficulty: "Intermediate",
        points: 20,
        completed: false,
        current: true,
        initialCode: `class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  
  // Implement the insert method
  insert(value) {
    // Your code here
  }
  
  // Implement the search method
  search(value) {
    // Your code here
  }
  
  // Implement the delete method
  delete(value) {
    // Your code here
  }
}
`,
        tests: [
          {
            name: "Basic insertion and search",
            test: `
const bst = new BST();
bst.insert(10);
bst.insert(5);
bst.insert(15);
if (bst.search(5) !== true) throw new Error("Should find value 5");
if (bst.search(10) !== true) throw new Error("Should find value 10");
if (bst.search(15) !== true) throw new Error("Should find value 15");
if (bst.search(20) !== false) throw new Error("Should not find value 20");
`,
            description: "Tests basic insertion and search functionality",
          },
          {
            name: "Delete operation",
            test: `
const bst = new BST();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.delete(5);
if (bst.search(5) !== false) throw new Error("Value 5 should be deleted");
if (bst.search(10) !== true) throw new Error("Value 10 should still exist");
if (bst.search(15) !== true) throw new Error("Value 15 should still exist");
`,
            description: "Tests delete functionality",
          },
          {
            name: "Edge cases",
            test: `
const bst = new BST();
if (bst.search(5) !== false) throw new Error("Empty tree should return false");
bst.insert(10);
bst.delete(10);
if (bst.search(10) !== false) throw new Error("Value should be deleted");
// Should not throw when deleting non-existent value
try {
  bst.delete(999);
} catch (e) {
  throw new Error("Should handle deleting non-existent values");
}
`,
            description: "Tests edge cases",
          },
        ],
      },
      {
        id: "q2",
        type: "coding",
        title: "Build a Responsive Navigation Component",
        description: "Create a responsive navigation bar that collapses into a hamburger menu on mobile devices.",
        difficulty: "Intermediate",
        points: 15,
        completed: false,
        current: false,
        initialCode: "// Navigation component code will go here",
        tests: [],
      },
      {
        id: "q3",
        type: "multiple-choice",
        title: "JavaScript Fundamentals",
        description: "Answer questions about JavaScript core concepts and best practices.",
        difficulty: "Intermediate",
        points: 10,
        completed: false,
        current: false,
      },
      {
        id: "q4",
        type: "project",
        title: "Build a React Todo App",
        description:
          "Create a fully functional todo application with React, including state management and persistence.",
        difficulty: "Advanced",
        points: 30,
        completed: false,
        current: false,
      },
    ],
    totalPoints: 75,
  }

  const timeRemaining = {
    hours: 1,
    minutes: 30,
  }

  useEffect(() => {
    // Calculate initial progress
    const completedQuestions = assessment.questions.filter((q) => q.completed).length
    setProgress(Math.round((completedQuestions / assessment.questions.length) * 100))
  }, [assessment.questions])

  const handleSaveSolution = async (code: string, results: TestResult[]) => {
    setIsSaving(true)
    setTestResults(results)

    try {
      // In a real app, we would send the code to the backend for saving
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Solution saved",
        description: "Your code has been saved as a draft",
      })

      // Update progress if all tests pass
      const allTestsPassed = results.every((r) => r.passed)
      if (allTestsPassed) {
        const updatedQuestions = [...assessment.questions]
        updatedQuestions[currentQuestionIndex].completed = true

        // Calculate new progress
        const completedCount = updatedQuestions.filter((q) => q.completed).length
        setProgress(Math.round((completedCount / assessment.questions.length) * 100))
      }
    } catch (error) {
      toast({
        title: "Error saving solution",
        description: "There was a problem saving your code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitSolution = async () => {
    setIsSubmitting(true)

    try {
      // In a real app, we would submit the final solution to the backend
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      toast({
        title: "Solution submitted",
        description: "Your solution has been submitted successfully",
      })

      // Mark current question as completed
      const updatedQuestions = [...assessment.questions]
      updatedQuestions[currentQuestionIndex].completed = true

      // Calculate new progress
      const completedCount = updatedQuestions.filter((q) => q.completed).length
      setProgress(Math.round((completedCount / assessment.questions.length) * 100))
    } catch (error) {
      toast({
        title: "Error submitting solution",
        description: "There was a problem submitting your solution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < assessment.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-background">
        <div className="w-full flex justify-center">
          <div className="container max-w-6xl flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6" />
              <span>DevAssess</span>
            </div>
            <div className="flex items-center gap-4">
              <TimerButton timeRemaining={`${timeRemaining.hours}h ${timeRemaining.minutes}m`} />
              <WarningButton>End Assessment</WarningButton>
              <Link href="/developer/dashboard">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
                <p className="text-muted-foreground">
                  {assessment.company} • {assessment.timeLimit} minutes • {assessment.totalPoints} points total
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-[200px]" />
                  <span className="text-sm font-medium">{progress}% complete</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    Secure Mode Active
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    Screen Recording On
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted/50 ${
                        index === currentQuestionIndex
                          ? "bg-primary/10 border border-primary/30"
                          : question.completed
                            ? "bg-green-50"
                            : ""
                      }`}
                      onClick={() => navigateToQuestion(index)}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          question.completed
                            ? "bg-green-100 text-green-800"
                            : index === currentQuestionIndex
                              ? "bg-primary/20 text-primary"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {question.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{question.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {question.type === "coding"
                            ? "Coding Challenge"
                            : question.type === "multiple-choice"
                              ? "Multiple Choice"
                              : "Project Task"}
                        </div>
                      </div>
                      <div className="text-xs font-medium">{question.points} pts</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Question {currentQuestionIndex + 1}: {currentQuestion.title}
                      </CardTitle>
                      <CardDescription>
                        {currentQuestion.type === "coding"
                          ? "Coding Challenge"
                          : currentQuestion.type === "multiple-choice"
                            ? "Multiple Choice"
                            : "Project Task"}{" "}
                        • {currentQuestion.points} points
                      </CardDescription>
                    </div>
                    <Badge>{currentQuestion.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Description</h3>
                    <p>{currentQuestion.description}</p>
                  </div>
                  {currentQuestion.type === "coding" && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Requirements</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Implement a Node class with value, left, and right properties</li>
                        <li>Implement a BST class with insert, search, and delete methods</li>
                        <li>The insert method should maintain the BST property</li>
                        <li>The search method should return true if a value exists in the tree</li>
                        <li>The delete method should remove a node while maintaining the BST property</li>
                        <li>Include appropriate error handling</li>
                      </ul>
                    </div>
                  )}
                  {currentQuestion.type === "coding" && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Example</h3>
                      <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                        <pre>{`const bst = new BST();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.search(5); // should return true
bst.search(20); // should return false
bst.delete(5);
bst.search(5); // should return false`}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentQuestion.type === "coding" && (
                <CodeEditor
                  initialCode={currentQuestion.initialCode || "// Write your code here"}
                  language="javascript"
                  tests={currentQuestion.tests || []}
                  onSave={handleSaveSolution}
                />
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous Question
                </Button>
                <Button
                  className="gap-1"
                  onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === assessment.questions.length - 1}
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <Card>
                <CardFooter className="flex justify-between p-4">
                  <Button variant="outline" className="gap-2" onClick={() => {}}>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <SubmitSolutionButton onClick={handleSubmitSolution} disabled={isSubmitting} loading={isSubmitting}>
                    Submit Solution
                  </SubmitSolutionButton>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

