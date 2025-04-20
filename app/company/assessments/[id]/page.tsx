"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Download,
  CheckCircle,
  Clock,
  Mail,
  ExternalLink,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AssessmentDashboardPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock assessment data
  const [assessment, setAssessment] = useState({
    id: "",
    title: "",
    description: "",
    difficulty: "",
    timeLimit: 0,
    status: "",
    createdAt: "",
    updatedAt: "",
    questions: [],
    skills: [],
    candidates: [],
  })

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from an API
        // For demo, we'll simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setAssessment({
          id: params.id,
          title: "Senior Frontend Developer Assessment",
          description:
            "This assessment evaluates advanced React skills, state management, and responsive design implementation.",
          difficulty: "Advanced",
          timeLimit: 90,
          status: "active",
          createdAt: "2025-03-15T10:00:00Z",
          updatedAt: "2025-03-20T14:30:00Z",
          questions: [
            {
              id: "q1",
              title: "Implement a function to reverse a string",
              difficulty: "easy",
              timeEstimate: 10,
            },
            {
              id: "q2",
              title: "Create a function to check if a string is a palindrome",
              difficulty: "easy",
              timeEstimate: 10,
            },
            {
              id: "q3",
              title: "Build a responsive navigation component",
              difficulty: "intermediate",
              timeEstimate: 30,
            },
          ],
          skills: ["React", "TypeScript", "CSS", "JavaScript"],
          candidates: [
            {
              id: "c1",
              name: "Alex Johnson",
              email: "alex@example.com",
              status: "completed",
              score: 92,
              submittedAt: "2025-03-18T15:45:00Z",
              timeSpent: 75,
            },
            {
              id: "c2",
              name: "Sam Williams",
              email: "sam@example.com",
              status: "in_progress",
              score: null,
              submittedAt: null,
              timeSpent: 30,
            },
            {
              id: "c3",
              name: "Jamie Smith",
              email: "jamie@example.com",
              status: "not_started",
              score: null,
              submittedAt: null,
              timeSpent: 0,
            },
            {
              id: "c4",
              name: "Taylor Brown",
              email: "taylor@example.com",
              status: "completed",
              score: 78,
              submittedAt: "2025-03-19T11:20:00Z",
              timeSpent: 85,
            },
            {
              id: "c5",
              name: "Jordan Lee",
              email: "jordan@example.com",
              status: "completed",
              score: 65,
              submittedAt: "2025-03-17T09:10:00Z",
              timeSpent: 90,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching assessment:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [params.id, toast])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        )
      case "not_started":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Not Started
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const filteredCandidates = assessment.candidates.filter((candidate) => {
    // Filter by status
    if (filterStatus !== "all" && candidate.status !== filterStatus) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return candidate.name.toLowerCase().includes(query) || candidate.email.toLowerCase().includes(query)
    }

    return true
  })

  const completionRate =
    assessment.candidates.length > 0
      ? Math.round(
          (assessment.candidates.filter((c) => c.status === "completed").length / assessment.candidates.length) * 100,
        )
      : 0

  const averageScore =
    assessment.candidates.filter((c) => c.status === "completed").length > 0
      ? Math.round(
          assessment.candidates.filter((c) => c.status === "completed").reduce((sum, c) => sum + c.score, 0) /
            assessment.candidates.filter((c) => c.status === "completed").length,
        )
      : 0

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
            <div className="flex justify-center items-center h-[70vh]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading assessment...</p>
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
            <Button variant="outline" size="sm" onClick={() => router.push("/company/assessments")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Assessments
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
            <Badge
              className={`ml-2 ${
                assessment.status === "active"
                  ? "bg-green-100 text-green-800"
                  : assessment.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
            </Badge>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-3"
              >
                <Card className="md:col-span-2 hover-lift">
                  <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p>{assessment.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
                        <p>{assessment.difficulty}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Time Limit</h3>
                        <p>{assessment.timeLimit} minutes</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {assessment.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/5">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                        <p>{formatDate(assessment.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                        <p>{formatDate(assessment.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="gap-1 mr-2"
                      onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Assessment
                    </Button>
                    <Button variant="outline" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>

                <div className="space-y-6">
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Assessment Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Candidates</span>
                          <span className="font-medium">{assessment.candidates.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Questions</span>
                          <span className="font-medium">{assessment.questions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-medium">{averageScore}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Completion Status</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{completionRate}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
                          <div>
                            <div className="font-medium">
                              {assessment.candidates.filter((c) => c.status === "completed").length}
                            </div>
                            <div className="text-muted-foreground">Completed</div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {assessment.candidates.filter((c) => c.status === "in_progress").length}
                            </div>
                            <div className="text-muted-foreground">In Progress</div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {assessment.candidates.filter((c) => c.status === "not_started").length}
                            </div>
                            <div className="text-muted-foreground">Not Started</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start gap-2">
                        <Mail className="h-4 w-4" />
                        Invite Candidates
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Download className="h-4 w-4" />
                        Export Results
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Preview Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-6 animate-fade-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Candidates</CardTitle>
                      <CardDescription>Manage candidates taking this assessment</CardDescription>
                    </div>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Invite Candidates
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search candidates..."
                          className="pl-8 w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="not_started">Not Started</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">Candidate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Time Spent</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((candidate) => (
                              <TableRow key={candidate.id}>
                                <TableCell className="font-medium">
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
                                <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                                <TableCell>
                                  {candidate.score !== null ? (
                                    <div className="flex items-center gap-2">
                                      <Progress value={candidate.score} className="h-2 w-16" />
                                      <span className="font-medium">{candidate.score}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {candidate.timeSpent > 0 ? (
                                    <span>{candidate.timeSpent} min</span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {candidate.submittedAt ? (
                                    formatDate(candidate.submittedAt)
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/company/candidates/${candidate.id}`)}
                                      >
                                        View Profile
                                      </DropdownMenuItem>
                                      {candidate.status === "completed" && (
                                        <DropdownMenuItem>View Results</DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">Remove Candidate</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                No candidates found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6 animate-fade-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Assessment Questions</CardTitle>
                      <CardDescription>View and manage questions in this assessment</CardDescription>
                    </div>
                    <Button onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Questions
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assessment.questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                Question {index + 1}: {question.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {question.timeEstimate} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

