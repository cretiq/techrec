"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Progress } from "@/components/ui/progress"
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs'
import {  Input  } from '@/components/ui-daisy/input'
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Building,
  BarChart,
} from "lucide-react"
import {  Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui-daisy/select'

// Mock assessments data
const assessmentsData = [
  {
    id: "1",
    title: "Frontend Developer Technical Assessment",
    company: "TechCorp Inc.",
    companyLogo: "/placeholder.svg?height=40&width=40",
    role: "Senior Frontend Developer",
    roleId: "1",
    status: "pending",
    dueDate: "2025-04-15",
    timeLimit: 90,
    questions: 5,
    difficulty: "Advanced",
    skills: ["React", "TypeScript", "CSS", "Next.js"],
    description: "This assessment evaluates your frontend development skills with a focus on React and TypeScript.",
    requiredForApplication: true,
  },
  {
    id: "2",
    title: "Backend Node.js Assessment",
    company: "DataSystems LLC",
    companyLogo: "/placeholder.svg?height=40&width=40",
    role: "Backend Engineer",
    roleId: "2",
    status: "in_progress",
    dueDate: "2025-04-10",
    timeLimit: 60,
    questions: 4,
    difficulty: "Intermediate",
    skills: ["Node.js", "Express", "MongoDB", "API Design"],
    description: "Test your backend development skills with Node.js and database knowledge.",
    progress: 25,
    requiredForApplication: true,
  },
  {
    id: "3",
    title: "Full Stack Development Challenge",
    company: "InnovateSoft",
    companyLogo: "/placeholder.svg?height=40&width=40",
    role: "Full Stack Developer",
    roleId: "3",
    status: "completed",
    completedDate: "2025-03-28",
    timeLimit: 120,
    questions: 8,
    difficulty: "Advanced",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL"],
    description: "A comprehensive assessment of your full stack development capabilities.",
    score: 92,
    requiredForApplication: true,
  },
  {
    id: "4",
    title: "DevOps Engineering Test",
    company: "CloudTech Systems",
    companyLogo: "/placeholder.svg?height=40&width=40",
    role: "DevOps Engineer",
    roleId: "4",
    status: "completed",
    completedDate: "2025-03-25",
    timeLimit: 90,
    questions: 6,
    difficulty: "Expert",
    skills: ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"],
    description: "Evaluate your DevOps skills with a focus on cloud infrastructure and automation.",
    score: 78,
    requiredForApplication: true,
  },
  {
    id: "5",
    title: "Mobile Development Assessment",
    company: "AppWorks Inc.",
    companyLogo: "/placeholder.svg?height=40&width=40",
    role: "Mobile Developer",
    roleId: "5",
    status: "expired",
    dueDate: "2025-03-20",
    timeLimit: 75,
    questions: 5,
    difficulty: "Intermediate",
    skills: ["React Native", "JavaScript", "Mobile UI", "State Management"],
    description: "Test your mobile development skills with React Native and JavaScript.",
    requiredForApplication: true,
  },
]

export default function DeveloperAssessmentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Get status filter from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const statusParam = params.get("status")
    if (statusParam) {
      setActiveTab(statusParam)
    }
  }, [])

  // Filter assessments based on tab and search
  const filteredAssessments = assessmentsData.filter((assessment) => {
    // Filter by tab
    if (activeTab !== "all" && assessment.status !== activeTab) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !assessment.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !assessment.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  // Get counts for each status
  const counts = {
    all: assessmentsData.length,
    pending: assessmentsData.filter((a) => a.status === "pending").length,
    in_progress: assessmentsData.filter((a) => a.status === "in_progress").length,
    completed: assessmentsData.filter((a) => a.status === "completed").length,
    expired: assessmentsData.filter((a) => a.status === "expired").length,
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
      case "in_progress":
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return null
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "in_progress":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Assessments</h1>
              <p className="text-muted-foreground">View and complete technical assessments for job applications</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assessments..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="due-date">Sort by: Due Date</SelectItem>
                  <SelectItem value="difficulty">Sort by: Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex gap-2 items-center">
                  All
                  <Badge variant="secondary" className="ml-1">
                    {counts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex gap-2 items-center">
                  Pending
                  <Badge variant="secondary" className="ml-1">
                    {counts.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="flex gap-2 items-center">
                  In Progress
                  <Badge variant="secondary" className="ml-1">
                    {counts.in_progress}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex gap-2 items-center">
                  Completed
                  <Badge variant="secondary" className="ml-1">
                    {counts.completed}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex gap-2 items-center">
                  Expired
                  <Badge variant="secondary" className="ml-1">
                    {counts.expired}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredAssessments.length > 0 ? (
                    filteredAssessments.map((assessment) => (
                      <Card key={assessment.id} className="overflow-hidden hover-subtle">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold">{assessment.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{assessment.company}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">For: {assessment.role}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {getStatusBadge(assessment.status)}
                                  {assessment.status === "in_progress" && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        {assessment.progress}% complete
                                      </span>
                                      <Progress value={assessment.progress} className="w-[100px] h-2" />
                                    </div>
                                  )}
                                  {assessment.status === "completed" && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-sm font-medium">Score:</span>
                                      <Badge className="bg-green-100 text-green-800">{assessment.score}%</Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-3">
                                {assessment.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="bg-primary/5">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              <p className="mt-3 text-sm">{assessment.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Time Limit</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{assessment.timeLimit} minutes</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Questions</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <FileText className="h-4 w-4" />
                                    <span>{assessment.questions} questions</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Difficulty</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <BarChart className="h-4 w-4" />
                                    <span>{assessment.difficulty}</span>
                                  </div>
                                </div>
                                <div>
                                  {assessment.status === "pending" || assessment.status === "in_progress" ? (
                                    <>
                                      <p className="text-sm text-muted-foreground">Due Date</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(assessment.dueDate).toLocaleDateString()}</span>
                                      </div>
                                    </>
                                  ) : assessment.status === "completed" ? (
                                    <>
                                      <p className="text-sm text-muted-foreground">Completed On</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{new Date(assessment.completedDate).toLocaleDateString()}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-sm text-muted-foreground">Expired On</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span>{new Date(assessment.dueDate).toLocaleDateString()}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col justify-between gap-4">
                              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                                {getStatusIcon(assessment.status)}
                              </div>

                              {assessment.status === "pending" && (
                                <Button
                                  className="gap-1"
                                  onClick={() => router.push(`/developer/assessment/${assessment.id}`)}
                                >
                                  Start Assessment
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}

                              {assessment.status === "in_progress" && (
                                <Button
                                  className="gap-1"
                                  onClick={() => router.push(`/developer/assessment/${assessment.id}`)}
                                >
                                  Continue Assessment
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}

                              {assessment.status === "completed" && (
                                <Button
                                  variant="outline"
                                  className="gap-1"
                                  onClick={() => router.push(`/developer/assessment/${assessment.id}/results`)}
                                >
                                  View Results
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}

                              {assessment.status === "expired" && (
                                <Button variant="outline" className="gap-1" disabled>
                                  Assessment Expired
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {assessment.requiredForApplication && (
                                <div className="text-center text-xs text-muted-foreground">
                                  Required for job application
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No assessments found</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        {activeTab === "all"
                          ? "You don't have any assessments yet. Browse roles to find opportunities that match your skills."
                          : `You don't have any ${activeTab.replace("_", " ")} assessments.`}
                      </p>
                      <Button onClick={() => router.push("/developer/roles")}>Browse Roles</Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

