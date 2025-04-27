"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Building,
  MapPin,
  Clock,
  Calendar,
  User,
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Loader2,
  LockIcon,
  FileCheck,
  ArrowRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { formatJobType } from "@/utils/format"

// Mock role data
const roleData = {
  id: "1",
  title: "Senior Frontend Developer",
  company: "TechCorp Inc.",
  companyLogo: "/placeholder.svg?height=40&width=40",
  location: "San Francisco, CA (Remote)",
  type: "Full-time",
  salary: "$120,000 - $150,000",
  posted: "2 days ago",
  deadline: "2 weeks from now",
  skills: ["React", "TypeScript", "CSS", "Next.js", "Redux"],
  requiredExperience: "5+ years",
  description: `
    <p>We're looking for a Senior Frontend Developer to join our team and help build our next-generation web applications.</p>
    
    <h3>Responsibilities:</h3>
    <ul>
      <li>Develop new user-facing features using React.js</li>
      <li>Build reusable components and front-end libraries for future use</li>
      <li>Translate designs and wireframes into high-quality code</li>
      <li>Optimize components for maximum performance across a vast array of web-capable devices and browsers</li>
      <li>Collaborate with the design team to implement UI/UX best practices</li>
    </ul>
    
    <h3>Requirements:</h3>
    <ul>
      <li>5+ years of experience in frontend development</li>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
      <li>Thorough understanding of React.js and its core principles</li>
      <li>Experience with popular React.js workflows (such as Redux)</li>
      <li>Familiarity with newer specifications of ECMAScript</li>
      <li>Experience with data structure libraries (e.g., Immutable.js)</li>
      <li>Knowledge of isomorphic React is a plus</li>
      <li>Understanding of server-side rendering</li>
    </ul>
  `,
  matchPercentage: 92,
  matchDetails: [
    {
      category: "Skills",
      match: 95,
      requiredSkills: ["React", "TypeScript", "CSS", "Next.js", "Redux"],
      matchedSkills: ["React", "TypeScript", "CSS", "Next.js"],
    },
    { category: "Experience", match: 90, required: "5+ years", yours: "8 years" },
    {
      category: "Education",
      match: 100,
      required: "Bachelor's in Computer Science or related field",
      yours: "M.S. Computer Science",
    },
    { category: "Location", match: 100, required: "Remote", yours: "Remote" },
  ],
  aboutCompany:
    "TechCorp Inc. is a leading technology company specializing in innovative software solutions for businesses of all sizes. With a team of over 200 employees worldwide, we're dedicated to creating products that help our clients succeed in the digital age.",
  requiresTechnicalAssessment: true,
  technicalAssessment: {
    id: "1",
    title: "Frontend Developer Technical Assessment",
    timeLimit: 90,
    questions: 5,
    difficulty: "Advanced",
    skills: ["React", "TypeScript", "CSS", "Next.js"],
    description: "This assessment evaluates your frontend development skills with a focus on React and TypeScript.",
  },
}

// Mock assessment status
const mockAssessmentStatus = {
  id: "1",
  status: "pending", // pending, in_progress, completed, expired
  dueDate: "2025-04-15",
  score: null,
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isApplying, setIsApplying] = useState(false)
  const [assessmentStatus, setAssessmentStatus] = useState(mockAssessmentStatus)

  // Check if user can apply (either no assessment required or assessment completed)
  const canApply = !roleData.requiresTechnicalAssessment || assessmentStatus.status === "completed"

  const handleApply = async () => {
    if (!canApply) {
      toast({
        title: "Assessment Required",
        description: "You need to complete the technical assessment before applying.",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Application submitted",
      description: "Your application has been sent to TechCorp Inc.",
    })

    setIsApplying(false)
  }

  const handleStartAssessment = () => {
    router.push(`/developer/assessment/${assessmentStatus.id}`)
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
              <Link href="/developer/roles" className="text-sm font-medium underline underline-offset-4">
                Browse Roles
              </Link>
              <Link href="/developer/assessments" className="text-sm font-medium hover:underline underline-offset-4">
                Assessments
              </Link>
              <Link href="/developer/profile" className="text-sm font-medium hover:underline underline-offset-4">
                Profile
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6 w-full">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back to roles
            </Button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{roleData.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{roleData.company}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{roleData.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {roleData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-primary/5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  className={`text-base px-3 py-1 ${
                    roleData.matchPercentage >= 90
                      ? "bg-green-100 text-green-800"
                      : roleData.matchPercentage >= 70
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {roleData.matchPercentage}% Match
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Posted {roleData.posted}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Apply by {roleData.deadline}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: roleData.description }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {roleData.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={roleData.companyLogo} />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{roleData.company}</h3>
                      <p className="text-sm text-muted-foreground">{roleData.location}</p>
                    </div>
                  </div>
                  <p>{roleData.aboutCompany}</p>
                </CardContent>
              </Card>

              {roleData.requiresTechnicalAssessment && (
                <Card className="border-amber-200">
                  <CardHeader className="bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-amber-600" />
                        Technical Assessment Required
                      </CardTitle>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        {assessmentStatus.status === "pending" && "Pending"}
                        {assessmentStatus.status === "in_progress" && "In Progress"}
                        {assessmentStatus.status === "completed" && "Completed"}
                        {assessmentStatus.status === "expired" && "Expired"}
                      </Badge>
                    </div>
                    <CardDescription>
                      You must complete this assessment before you can apply for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg">{roleData.technicalAssessment.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{roleData.technicalAssessment.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Time Limit</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{roleData.technicalAssessment.timeLimit} minutes</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Questions</p>
                          <div className="flex items-center gap-1 mt-1">
                            <FileText className="h-4 w-4" />
                            <span>{roleData.technicalAssessment.questions} questions</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Award className="h-4 w-4" />
                            <span>{roleData.technicalAssessment.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {roleData.technicalAssessment.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 border-amber-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-amber-50 border-t border-amber-200">
                    {assessmentStatus.status === "pending" && (
                      <Button className="w-full gap-1" onClick={handleStartAssessment}>
                        Start Assessment
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {assessmentStatus.status === "in_progress" && (
                      <Button className="w-full gap-1" onClick={handleStartAssessment}>
                        Continue Assessment
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {assessmentStatus.status === "completed" && (
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Assessment completed</span>
                          {assessmentStatus.score && (
                            <Badge className="bg-green-100 text-green-800">Score: {assessmentStatus.score}%</Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/developer/assessment/${assessmentStatus.id}/results`)}
                        >
                          View Results
                        </Button>
                      </div>
                    )}

                    {assessmentStatus.status === "expired" && (
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Assessment expired</span>
                        </div>
                        <Button variant="outline" disabled>
                          Expired
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Match</CardTitle>
                  <CardDescription>How your profile matches this role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-2">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{roleData.matchPercentage}%</span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={
                            roleData.matchPercentage >= 90
                              ? "#22c55e"
                              : roleData.matchPercentage >= 70
                                ? "#3b82f6"
                                : "#f59e0b"
                          }
                          strokeWidth="10"
                          strokeDasharray={`${(2 * Math.PI * 45 * roleData.matchPercentage) / 100} ${2 * Math.PI * 45 * (1 - roleData.matchPercentage / 100)}`}
                          strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Your profile is a{" "}
                      {roleData.matchPercentage >= 90 ? "strong" : roleData.matchPercentage >= 70 ? "good" : "fair"}{" "}
                      match for this role
                    </p>
                  </div>

                  <div className="space-y-4">
                    {roleData.matchDetails.map((detail, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{detail.category}</span>
                          <span
                            className={`text-sm ${
                              detail.match >= 90
                                ? "text-green-600"
                                : detail.match >= 70
                                  ? "text-blue-600"
                                  : "text-amber-600"
                            }`}
                          >
                            {detail.match}% match
                          </span>
                        </div>
                        <Progress value={detail.match} className="h-2" />

                        {detail.category === "Skills" && (
                          <div className="mt-2 space-y-1">
                            <div className="text-sm text-muted-foreground">Required skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {detail.requiredSkills?.map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className={detail.matchedSkills?.includes(skill) ? "bg-green-50 text-green-700" : ""}
                                >
                                  {skill}
                                  {detail.matchedSkills?.includes(skill) && (
                                    <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {detail.category !== "Skills" && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Required:</span>
                              <p>{detail.required}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Yours:</span>
                              <p>{detail.yours}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-1" onClick={handleApply} disabled={isApplying || !canApply}>
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : !canApply ? (
                      <>
                        <LockIcon className="h-4 w-4" />
                        Complete Assessment to Apply
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Apply Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type</span>
                    <span>{formatJobType(roleData.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary Range</span>
                    <span>{roleData.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span>{roleData.requiredExperience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span>{roleData.posted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline</span>
                    <span>{roleData.deadline}</span>
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

