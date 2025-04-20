"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, Filter, MoreHorizontal, Calendar, Clock, Users, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateAssessmentButton } from "@/components/buttons"

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  // Mock assessment data
  const assessments = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      createdAt: "2025-03-15",
      status: "active",
      candidates: 24,
      completions: 18,
      averageScore: 82,
      timeLimit: 90,
      difficulty: "Advanced",
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: "2",
      title: "Backend Node.js Engineer",
      createdAt: "2025-03-10",
      status: "active",
      candidates: 16,
      completions: 12,
      averageScore: 78,
      timeLimit: 60,
      difficulty: "Intermediate",
      skills: ["Node.js", "Express", "MongoDB"],
    },
    {
      id: "3",
      title: "Full Stack Developer",
      createdAt: "2025-03-05",
      status: "draft",
      candidates: 0,
      completions: 0,
      averageScore: 0,
      timeLimit: 120,
      difficulty: "Advanced",
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    },
    {
      id: "4",
      title: "DevOps Engineer",
      createdAt: "2025-02-28",
      status: "completed",
      candidates: 10,
      completions: 10,
      averageScore: 85,
      timeLimit: 90,
      difficulty: "Expert",
      skills: ["Docker", "Kubernetes", "CI/CD", "AWS"],
    },
    {
      id: "5",
      title: "Mobile Developer",
      createdAt: "2025-02-20",
      status: "active",
      candidates: 8,
      completions: 5,
      averageScore: 76,
      timeLimit: 75,
      difficulty: "Intermediate",
      skills: ["React Native", "JavaScript", "Mobile UI"],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
              <p className="text-muted-foreground">Manage and track your technical assessments</p>
            </div>
            <CreateAssessmentButton onClick={() => (window.location.href = "/company/assessments/new")} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search assessments..." className="pl-8 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                  <SelectItem value="candidates">Most Candidates</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">All Assessments</CardTitle>
                    <div className="text-sm text-muted-foreground">Showing {assessments.length} assessments</div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-2">Assessment</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Created</div>
                      <div className="col-span-1">Candidates</div>
                      <div className="col-span-1">Avg. Score</div>
                      <div className="col-span-1">Time Limit</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="grid grid-cols-8 gap-4 p-4 border-t items-center list-item-hover"
                      >
                        <div className="col-span-2">
                          <div className="font-medium">{assessment.title}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assessment.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(assessment.createdAt)}</span>
                        </div>
                        <div className="col-span-1 flex items-center gap-1 text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{assessment.candidates}</span>
                          <span className="text-muted-foreground">({assessment.completions} completed)</span>
                        </div>
                        <div className="col-span-1 text-sm">
                          {assessment.averageScore > 0 ? `${assessment.averageScore}%` : "—"}
                        </div>
                        <div className="col-span-1 flex items-center gap-1 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{assessment.timeLimit} min</span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}
                              >
                                Edit Assessment
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>View Results</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Active Assessments</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Showing {assessments.filter((a) => a.status === "active").length} assessments
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-2">Assessment</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Created</div>
                      <div className="col-span-1">Candidates</div>
                      <div className="col-span-1">Avg. Score</div>
                      <div className="col-span-1">Time Limit</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {assessments
                      .filter((a) => a.status === "active")
                      .map((assessment) => (
                        <div
                          key={assessment.id}
                          className="grid grid-cols-8 gap-4 p-4 border-t items-center list-item-hover"
                        >
                          <div className="col-span-2">
                            <div className="font-medium">{assessment.title}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {assessment.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Badge className={getStatusColor(assessment.status)}>
                              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(assessment.createdAt)}</span>
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{assessment.candidates}</span>
                            <span className="text-muted-foreground">({assessment.completions} completed)</span>
                          </div>
                          <div className="col-span-1 text-sm">
                            {assessment.averageScore > 0 ? `${assessment.averageScore}%` : "—"}
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{assessment.timeLimit} min</span>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}
                                >
                                  Edit Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>View Results</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Draft Assessments</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Showing {assessments.filter((a) => a.status === "draft").length} assessments
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {assessments.filter((a) => a.status === "draft").length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 text-sm font-medium">
                        <div className="col-span-2">Assessment</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1">Created</div>
                        <div className="col-span-1">Candidates</div>
                        <div className="col-span-1">Avg. Score</div>
                        <div className="col-span-1">Time Limit</div>
                        <div className="col-span-1 text-right">Actions</div>
                      </div>
                      {assessments
                        .filter((a) => a.status === "draft")
                        .map((assessment) => (
                          <div
                            key={assessment.id}
                            className="grid grid-cols-8 gap-4 p-4 border-t items-center list-item-hover"
                          >
                            <div className="col-span-2">
                              <div className="font-medium">{assessment.title}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {assessment.skills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Badge className={getStatusColor(assessment.status)}>
                                {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="col-span-1 flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDate(assessment.createdAt)}</span>
                            </div>
                            <div className="col-span-1 flex items-center gap-1 text-sm">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{assessment.candidates}</span>
                              <span className="text-muted-foreground">({assessment.completions} completed)</span>
                            </div>
                            <div className="col-span-1 text-sm">
                              {assessment.averageScore > 0 ? `${assessment.averageScore}%` : "—"}
                            </div>
                            <div className="col-span-1 flex items-center gap-1 text-sm">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{assessment.timeLimit} min</span>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}
                                  >
                                    Edit Assessment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Publish</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No draft assessments</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        You don't have any draft assessments yet. Create a new assessment to get started.
                      </p>
                      <Button onClick={() => (window.location.href = "/company/assessments/new")} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Create Assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Completed Assessments</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Showing {assessments.filter((a) => a.status === "completed").length} assessments
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-2">Assessment</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Created</div>
                      <div className="col-span-1">Candidates</div>
                      <div className="col-span-1">Avg. Score</div>
                      <div className="col-span-1">Time Limit</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {assessments
                      .filter((a) => a.status === "completed")
                      .map((assessment) => (
                        <div
                          key={assessment.id}
                          className="grid grid-cols-8 gap-4 p-4 border-t items-center list-item-hover"
                        >
                          <div className="col-span-2">
                            <div className="font-medium">{assessment.title}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {assessment.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Badge className={getStatusColor(assessment.status)}>
                              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(assessment.createdAt)}</span>
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{assessment.candidates}</span>
                            <span className="text-muted-foreground">({assessment.completions} completed)</span>
                          </div>
                          <div className="col-span-1 text-sm">
                            {assessment.averageScore > 0 ? `${assessment.averageScore}%` : "—"}
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{assessment.timeLimit} min</span>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/company/assessments/${assessment.id}/edit`)}
                                >
                                  Edit Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Results</DropdownMenuItem>
                                <DropdownMenuItem>Export Report</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem>Archive</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

