"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Progress } from "@/components/ui-daisy/progress"
import { FileText, ArrowLeft, Download, CheckCircle, XCircle, Award, User } from "lucide-react"
import { useToast } from "@/components/ui-daisy/use-toast"

export default function AssessmentResultsPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState({
    assessment: {
      id: "",
      title: "",
      company: "",
      description: "",
      totalQuestions: 0,
      passThreshold: 0,
    },
    score: 0,
    passed: false,
    timeSpent: 0,
    submittedAt: "",
    questionBreakdown: [],
    feedback: "",
  })

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from an API
        // For demo, we'll simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setResults({
          assessment: {
            id: params.id,
            title: "Senior Frontend Developer Assessment",
            company: "TechCorp Inc.",
            description:
              "This assessment evaluates advanced React skills, state management, and responsive design implementation.",
            totalQuestions: 10,
            passThreshold: 70,
          },
          score: 85,
          passed: true,
          timeSpent: 75,
          submittedAt: "2025-03-18T15:45:00Z",
          questionBreakdown: [
            { category: "JavaScript Fundamentals", score: 90, maxScore: 100 },
            { category: "React Components", score: 85, maxScore: 100 },
            { category: "State Management", score: 80, maxScore: 100 },
            { category: "API Integration", score: 85, maxScore: 100 },
          ],
          feedback:
            "Great job! You demonstrated strong knowledge of React and JavaScript fundamentals. Consider reviewing state management patterns for more complex applications.",
        })
      } catch (error) {
        console.error("Error fetching results:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment results",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [params.id, toast])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="w-full flex justify-center">
            <div className="container max-w-6xl flex h-16 items-center justify-between px-4 md:px-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <FileText className="h-6 w-6" />
                <span>DevAssess</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/developer/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full flex justify-center">
          <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
            <div className="flex justify-center items-center h-[70vh]">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-lg font-medium">Loading assessment results...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
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
              <Link href="/developer/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                Dashboard
              </Link>
              <Link href="/developer/roles" className="text-sm font-medium hover:underline underline-offset-4">
                Browse Roles
              </Link>
              <Link href="/developer/assessments" className="text-sm font-medium hover:underline underline-offset-4">
                Assessments
              </Link>
              <Link href="/developer/cv-management" className="text-sm font-medium hover:underline underline-offset-4">
                My Profile & CV
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/developer/dashboard">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.push("/developer/assessments")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Assessments
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{results.assessment.title} Results</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="text-4xl font-bold flex items-center gap-2">
                      {results.passed ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                      {results.score}%
                    </div>
                    <Progress
                      value={results.score}
                      className="w-full h-2"
                      indicatorClassName={results.passed ? "bg-green-500" : "bg-red-500"}
                    />
                    <div className="text-sm text-muted-foreground">
                      Pass threshold: {results.assessment.passThreshold}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium">{results.assessment.company}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Spent</span>
                      <span className="font-medium">{results.timeSpent} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium">{formatDate(results.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">
                        {results.passed ? (
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Failed</Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full gap-1">
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                  <CardDescription>Your performance across different assessment categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.questionBreakdown.map((category, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category.category}</span>
                          <span className="font-medium">{category.score}%</span>
                        </div>
                        <Progress value={category.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback</CardTitle>
                  <CardDescription>Assessment feedback and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{results.feedback}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-md">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Add this certification to your profile</p>
                      <p className="text-sm text-muted-foreground">Showcase your skills to potential employers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Review your answers</p>
                      <p className="text-sm text-muted-foreground">See detailed feedback on each question</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/developer/assessments")}>
                    Back to Assessments
                  </Button>
                  <Button onClick={() => router.push("/developer/roles")}>Browse Matching Roles</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

