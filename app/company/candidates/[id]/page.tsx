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
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Send,
  Loader2,
  Star,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react"

export default function CandidateProfilePage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock candidate data
  const [candidate, setCandidate] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    appliedAt: "",
    status: "",
    matchScore: 0,
    skills: [],
    education: [],
    experience: [],
    assessments: [],
  })

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from an API
        // For demo, we'll simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setCandidate({
          id: params.id,
          name: "Alex Johnson",
          email: "alex@example.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          appliedAt: "2025-03-15T10:00:00Z",
          status: "matched",
          matchScore: 95,
          skills: [
            { name: "React", level: "advanced" },
            { name: "TypeScript", level: "intermediate" },
            { name: "JavaScript", level: "advanced" },
            { name: "CSS", level: "intermediate" },
            { name: "Node.js", level: "beginner" },
          ],
          education: [
            {
              institution: "University of California, Berkeley",
              degree: "B.S. Computer Science",
              year: "2018 - 2022",
            },
          ],
          experience: [
            {
              company: "TechStart Inc.",
              position: "Frontend Developer",
              duration: "2022 - Present",
              description:
                "Developed and maintained React applications, implemented responsive designs, and collaborated with backend developers.",
            },
            {
              company: "CodeLabs",
              position: "Web Development Intern",
              duration: "Summer 2021",
              description: "Assisted in developing web applications using React and Node.js.",
            },
          ],
          assessments: [
            {
              id: "a1",
              title: "Senior Frontend Developer",
              status: "completed",
              score: 92,
              completedAt: "2025-03-18T15:45:00Z",
              timeSpent: 75,
              maxTime: 90,
            },
            {
              id: "a2",
              title: "JavaScript Fundamentals",
              status: "completed",
              score: 98,
              completedAt: "2025-03-10T11:30:00Z",
              timeSpent: 45,
              maxTime: 60,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching candidate:", error)
        toast({
          title: "Error",
          description: "Failed to load candidate data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidate()
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
      case "matched":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Matched
          </Badge>
        )
      case "reviewing":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Reviewing
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getAssessmentStatusBadge = (status) => {
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

  const getSkillLevelBadge = (level) => {
    switch (level) {
      case "beginner":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Beginner</Badge>
      case "intermediate":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Intermediate</Badge>
      case "advanced":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Advanced</Badge>
      case "expert":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Expert</Badge>
      default:
        return null
    }
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
                <p className="text-lg font-medium">Loading candidate profile...</p>
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
              <Link href="/company/assessments" className="text-sm font-medium hover:underline underline-offset-4">
                Assessments
              </Link>
              <Link href="/company/candidates" className="text-sm font-medium underline underline-offset-4">
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
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.push("/company/candidates")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Candidates
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Candidate Profile</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-1"
            >
              <Card className="hover-lift">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="text-2xl">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                    <p className="text-muted-foreground mb-4">{candidate.email}</p>

                    {getStatusBadge(candidate.status)}

                    {candidate.matchScore > 0 && (
                      <div className="mt-4 flex items-center gap-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {candidate.matchScore}% Match
                        </Badge>
                      </div>
                    )}

                    <div className="w-full border-t my-6"></div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Applied: {formatDate(candidate.appliedAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full gap-1">
                    <Mail className="h-4 w-4" />
                    Contact Candidate
                  </Button>
                  <Button variant="outline" className="w-full gap-1">
                    <Download className="h-4 w-4" />
                    Download Resume
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="md:col-span-2"
            >
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Candidate Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Assessment Performance</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border rounded-md p-3 text-center">
                            <div className="text-2xl font-bold">
                              {candidate.assessments.filter((a) => a.status === "completed").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Assessments Completed</div>
                          </div>
                          <div className="border rounded-md p-3 text-center">
                            <div className="text-2xl font-bold">
                              {candidate.assessments.length > 0
                                ? Math.round(
                                    candidate.assessments.reduce((sum, a) => sum + (a.score || 0), 0) /
                                      candidate.assessments.length,
                                  )
                                : 0}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">Average Score</div>
                          </div>
                          <div className="border rounded-md p-3 text-center">
                            <div className="text-2xl font-bold">{candidate.matchScore}%</div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Top Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 5).map((skill, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-primary/5">
                                {skill.name}
                              </Badge>
                              {getSkillLevelBadge(skill.level)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Recent Assessment</h3>
                        {candidate.assessments.length > 0 ? (
                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{candidate.assessments[0].title}</h4>
                                <div className="text-sm text-muted-foreground">
                                  Completed on {formatDate(candidate.assessments[0].completedAt)}
                                </div>
                              </div>
                              {getAssessmentStatusBadge(candidate.assessments[0].status)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Score:</span>
                                <span className="font-medium">{candidate.assessments[0].score}%</span>
                              </div>
                              <Progress value={candidate.assessments[0].score} className="h-2" />
                              <div className="flex justify-between text-sm">
                                <span>Time spent:</span>
                                <span>
                                  {candidate.assessments[0].timeSpent} / {candidate.assessments[0].maxTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No assessments completed yet</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md p-4 text-muted-foreground italic">
                        No notes added yet. Click below to add notes about this candidate.
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Add Notes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="assessments" className="space-y-6 animate-fade-in">
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Assessment History</CardTitle>
                      <CardDescription>View all assessments taken by this candidate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {candidate.assessments.length > 0 ? (
                        <div className="space-y-4">
                          {candidate.assessments.map((assessment, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{assessment.title}</h3>
                                  <div className="text-sm text-muted-foreground">
                                    {assessment.completedAt
                                      ? `Completed on ${formatDate(assessment.completedAt)}`
                                      : "Not completed"}
                                  </div>
                                </div>
                                {getAssessmentStatusBadge(assessment.status)}
                              </div>
                              <div className="space-y-3 mt-4">
                                <div className="flex justify-between text-sm">
                                  <span>Score:</span>
                                  <span className="font-medium">{assessment.score}%</span>
                                </div>
                                <Progress value={assessment.score} className="h-2" />
                                <div className="flex justify-between text-sm">
                                  <span>Time spent:</span>
                                  <span>
                                    {assessment.timeSpent} / {assessment.maxTime} min
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No assessments completed yet</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-1">
                        <Send className="h-4 w-4" />
                        Assign New Assessment
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 animate-fade-in">
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {candidate.skills.map((skill, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span>{skill.name}</span>
                            </div>
                            {getSkillLevelBadge(skill.level)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Work Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {candidate.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4 relative">
                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                            <h3 className="font-medium">{exp.position}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              <span>{exp.company}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{exp.duration}</div>
                            <p className="mt-2 text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {candidate.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4 relative">
                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                            <h3 className="font-medium">{edu.degree}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <span>{edu.institution}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{edu.year}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

