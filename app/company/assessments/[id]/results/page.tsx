"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, ArrowLeft, Download, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AssessmentResultsPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState({
    assessment: {
      id: "",
      title: "",
      description: "",
      totalQuestions: 0,
      passThreshold: 0,
    },
    candidates: [],
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
            description:
              "This assessment evaluates advanced React skills, state management, and responsive design implementation.",
            totalQuestions: 10,
            passThreshold: 70,
          },
          candidates: [
            {
              id: "c1",
              name: "Alex Johnson",
              email: "alex@example.com",
              score: 92,
              passed: true,
              timeSpent: 75,
              submittedAt: "2025-03-18T15:45:00Z",
              questionBreakdown: [
                { category: "JavaScript Fundamentals", score: 95, maxScore: 100 },
                { category: "React Components", score: 90, maxScore: 100 },
                { category: "State Management", score: 85, maxScore: 100 },
                { category: "API Integration", score: 95, maxScore: 100 },
              ],
            },
            {
              id: "c2",
              name: "Taylor Brown",
              email: "taylor@example.com",
              score: 78,
              passed: true,
              timeSpent: 85,
              submittedAt: "2025-03-19T11:20:00Z",
              questionBreakdown: [
                { category: "JavaScript Fundamentals", score: 80, maxScore: 100 },
                { category: "React Components", score: 75, maxScore: 100 },
                { category: "State Management", score: 70, maxScore: 100 },
                { category: "API Integration", score: 85, maxScore: 100 },
              ],
            },
            {
              id: "c3",
              name: "Jordan Lee",
              email: "jordan@example.com",
              score: 65,
              passed: false,
              timeSpent: 90,
              submittedAt: "2025-03-17T09:10:00Z",
              questionBreakdown: [
                { category: "JavaScript Fundamentals", score: 70, maxScore: 100 },
                { category: "React Components", score: 60, maxScore: 100 },
                { category: "State Management", score: 55, maxScore: 100 },
                { category: "API Integration", score: 75, maxScore: 100 },
              ],
            },
            {
              id: "c4",
              name: "Casey Morgan",
              email: "casey@example.com",
              score: 88,
              passed: true,
              timeSpent: 65,
              submittedAt: "2025-03-20T14:30:00Z",
              questionBreakdown: [
                { category: "JavaScript Fundamentals", score: 90, maxScore: 100 },
                { category: "React Components", score: 85, maxScore: 100 },
                { category: "State Management", score: 80, maxScore: 100 },
                { category: "API Integration", score: 95, maxScore: 100 },
              ],
            },
          ],
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
                <Button variant="outline" size="sm">
                  RightHub
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full flex justify-center">
          <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
            <div className="flex justify-center items-center h-[70vh]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Link href="/company/dashboard">
                <Button variant="outline" size="sm">
                  RightHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.push(`/company/assessments/${params.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Assessment
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{results.assessment.title} Results</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Candidates</span>
                      <span className="font-medium">{results.candidates.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pass Rate</span>
                      <span className="font-medium">
                        {Math.round(
                          (results.candidates.filter((c) => c.passed).length / results.candidates.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="font-medium">
                        {Math.round(
                          results.candidates.reduce((sum, c) => sum + c.score, 0) / results.candidates.length,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pass Threshold</span>
                      <span className="font-medium">{results.assessment.passThreshold}%</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full gap-1">
                      <Download className="h-4 w-4" />
                      Export Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Results</CardTitle>
                  <CardDescription>Performance of all candidates who completed this assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Candidate</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarFallback>
                                  {candidate.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  href={`/company/developers/${candidate.id}`}
                                  className="font-medium hover:text-primary hover:underline"
                                >
                                  {candidate.name}
                                </Link>
                                <div className="text-xs text-muted-foreground">{candidate.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={candidate.score} className="h-2 w-16" />
                              <span className="font-medium">{candidate.score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {candidate.passed ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {candidate.timeSpent} min
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(candidate.submittedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/company/assessments/${params.id}/results/${candidate.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>Average scores across different assessment categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.candidates[0].questionBreakdown.map((category, index) => {
                      const avgScore = Math.round(
                        results.candidates.reduce((sum, c) => sum + c.questionBreakdown[index].score, 0) /
                          results.candidates.length,
                      )

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category.category}</span>
                            <span className="font-medium">{avgScore}%</span>
                          </div>
                          <Progress value={avgScore} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

