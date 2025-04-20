"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, MoreHorizontal, Calendar, Mail, MapPin, Download, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState("all")

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get("status")
    if (status && ["all", "matched", "reviewing", "pending", "rejected"].includes(status)) {
      setActiveTab(status)
    }
  }, [searchParams])

  // Mock candidate data
  const candidates = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      status: "matched",
      matchScore: 95,
      assessments: [
        { title: "Senior Frontend Developer", score: 92, date: "2025-03-15" },
        { title: "JavaScript Fundamentals", score: 98, date: "2025-03-10" },
      ],
      skills: ["React", "TypeScript", "CSS", "Node.js"],
      appliedDate: "2025-03-18",
    },
    {
      id: "2",
      name: "Sam Williams",
      email: "sam@example.com",
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      status: "reviewing",
      matchScore: 88,
      assessments: [{ title: "Backend Node.js Engineer", score: 88, date: "2025-03-12" }],
      skills: ["Node.js", "Express", "MongoDB", "TypeScript"],
      appliedDate: "2025-03-15",
    },
    {
      id: "3",
      name: "Jamie Smith",
      email: "jamie@example.com",
      phone: "+1 (555) 345-6789",
      location: "Austin, TX",
      status: "pending",
      matchScore: 0,
      assessments: [],
      skills: ["React", "JavaScript", "HTML/CSS"],
      appliedDate: "2025-03-20",
    },
    {
      id: "4",
      name: "Taylor Brown",
      email: "taylor@example.com",
      phone: "+1 (555) 456-7890",
      location: "Seattle, WA",
      status: "matched",
      matchScore: 92,
      assessments: [{ title: "DevOps Engineer", score: 95, date: "2025-03-05" }],
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
      appliedDate: "2025-03-08",
    },
    {
      id: "5",
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "+1 (555) 567-8901",
      location: "Chicago, IL",
      status: "rejected",
      matchScore: 65,
      assessments: [{ title: "Full Stack Developer", score: 65, date: "2025-03-02" }],
      skills: ["JavaScript", "React", "Express", "MongoDB"],
      appliedDate: "2025-03-05",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "matched":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "reviewing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
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
              <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
              <p className="text-muted-foreground">Manage and track candidates for your technical assessments</p>
            </div>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Invite Candidate
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search candidates..." className="pl-8 w-full" />
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
                  <SelectItem value="match-high">Highest Match</SelectItem>
                  <SelectItem value="match-low">Lowest Match</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-md mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="matched">Matched</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">All Candidates</CardTitle>
                    <div className="text-sm text-muted-foreground">Showing {candidates.length} candidates</div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-2">Candidate</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Applied</div>
                      <div className="col-span-1">Match Score</div>
                      <div className="col-span-1">Assessments</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="grid grid-cols-7 gap-4 p-4 border-t items-center list-item-hover"
                      >
                        <div className="col-span-2">
                          <div className="flex items-center gap-3">
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
                              <div className="flex flex-col text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{candidate.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{candidate.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(candidate.appliedDate)}</span>
                        </div>
                        <div className="col-span-1">
                          {candidate.matchScore > 0 ? (
                            <div className="flex items-center gap-2">
                              <Progress value={candidate.matchScore} className="h-2 w-16" />
                              <span className="text-sm font-medium">{candidate.matchScore}%</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assessed</span>
                          )}
                        </div>
                        <div className="col-span-1 text-sm">
                          {candidate.assessments.length > 0 ? (
                            <div>
                              <span className="font-medium">{candidate.assessments.length}</span>
                              <span className="text-muted-foreground"> completed</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
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
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>View Assessments</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Change Status</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Remove Candidate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tab contents would be similar but filtered by status */}
            <TabsContent value="matched" className="space-y-4">
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Matched Candidates</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Showing {candidates.filter((c) => c.status === "matched").length} candidates
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {/* Similar content as "all" tab but filtered */}
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-2">Candidate</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">Applied</div>
                      <div className="col-span-1">Match Score</div>
                      <div className="col-span-1">Assessments</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {candidates
                      .filter((c) => c.status === "matched")
                      .map((candidate) => (
                        <div
                          key={candidate.id}
                          className="grid grid-cols-7 gap-4 p-4 border-t items-center list-item-hover"
                        >
                          {/* Same content as in the "all" tab */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-3">
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
                                <div className="flex flex-col text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{candidate.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{candidate.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="col-span-1 flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(candidate.appliedDate)}</span>
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center gap-2">
                              <Progress value={candidate.matchScore} className="h-2 w-16" />
                              <span className="text-sm font-medium">{candidate.matchScore}%</span>
                            </div>
                          </div>
                          <div className="col-span-1 text-sm">
                            <div>
                              <span className="font-medium">{candidate.assessments.length}</span>
                              <span className="text-muted-foreground"> completed</span>
                            </div>
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
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>View Assessments</DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Change Status</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Remove Candidate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Similar TabsContent for other tabs */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

