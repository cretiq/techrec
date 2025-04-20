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
  Star,
  Briefcase,
  GraduationCap,
  Github,
  Globe,
  Linkedin,
  Download,
  Send,
  Loader2,
  Code,
  MessageSquare,
} from "lucide-react"
import { SkillBadge } from "@/components/ui-components"

export default function DeveloperProfilePage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock developer data
  const [developer, setDeveloper] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    assessments: [],
    github: "",
    linkedin: "",
    website: "",
    availability: "",
    yearsOfExperience: 0,
  })

  // Fetch developer data
  useEffect(() => {
    const fetchDeveloper = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from an API
        // For demo, we'll simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setDeveloper({
          id: params.id,
          name: "Alex Johnson",
          email: "alex@example.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          title: "Senior Frontend Developer",
          bio: "Experienced frontend developer with a passion for creating intuitive user interfaces. Specialized in React and modern JavaScript frameworks.",
          skills: [
            { name: "React", level: "advanced" },
            { name: "TypeScript", level: "advanced" },
            { name: "JavaScript", level: "advanced" },
            { name: "CSS/SCSS", level: "intermediate" },
            { name: "Node.js", level: "intermediate" },
            { name: "GraphQL", level: "intermediate" },
            { name: "Next.js", level: "advanced" },
            { name: "Tailwind CSS", level: "advanced" },
          ],
          experiences: [
            {
              company: "TechStart Inc.",
              position: "Senior Frontend Developer",
              duration: "2022 - Present",
              description:
                "Lead frontend development for multiple web applications using React, TypeScript, and GraphQL. Implemented responsive designs and improved performance by 30%.",
            },
            {
              company: "WebSolutions",
              position: "Frontend Developer",
              duration: "2020 - 2022",
              description:
                "Developed and maintained React applications, collaborated with backend teams, and implemented unit testing.",
            },
            {
              company: "CodeLabs",
              position: "Web Development Intern",
              duration: "Summer 2019",
              description: "Assisted in developing web applications using React and Node.js.",
            },
          ],
          education: [
            {
              institution: "University of California, Berkeley",
              degree: "B.S. Computer Science",
              year: "2016 - 2020",
            },
            {
              institution: "Udacity",
              degree: "Frontend Web Developer Nanodegree",
              year: "2019",
            },
          ],
          projects: [
            {
              name: "E-commerce Platform",
              description: "A full-stack e-commerce platform built with React, Node.js, and MongoDB.",
              technologies: ["React", "Node.js", "MongoDB", "Express"],
              url: "https://github.com/alexj/ecommerce",
            },
            {
              name: "Task Management App",
              description: "A Kanban-style task management application with real-time updates.",
              technologies: ["React", "Firebase", "Material UI"],
              url: "https://github.com/alexj/taskmanager",
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
          github: "https://github.com/alexj",
          linkedin: "https://linkedin.com/in/alexj",
          website: "https://alexjohnson.dev",
          availability: "Available in 2 weeks",
          yearsOfExperience: 5,
        })
      } catch (error) {
        console.error("Error fetching developer:", error)
        toast({
          title: "Error",
          description: "Failed to load developer data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeveloper()
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
                <p className="text-lg font-medium">Loading developer profile...</p>
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
              <Link href="/company/dashboard" className="text-sm font-medium nav-item-hover">
                Dashboard
              </Link>
              <Link href="/company/assessments" className="text-sm font-medium nav-item-hover">
                Assessments
              </Link>
              <Link href="/company/candidates" className="text-sm font-medium nav-item-hover">
                Candidates
              </Link>
              <Link href="/company/settings" className="text-sm font-medium nav-item-hover">
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
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Developer Profile</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-1"
            >
              <Card className="hover-profile">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="text-2xl">
                        {developer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{developer.name}</h2>
                    <p className="text-muted-foreground">{developer.title}</p>

                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant="outline" className="bg-primary/5">
                        {developer.yearsOfExperience} years experience
                      </Badge>
                    </div>

                    <div className="w-full border-t my-6"></div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{developer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{developer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{developer.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{developer.availability}</span>
                      </div>
                    </div>

                    <div className="w-full border-t my-6"></div>

                    <div className="w-full space-y-3">
                      {developer.github && (
                        <Link
                          href={developer.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-primary transition-colors nav-item-hover"
                        >
                          <Github className="h-4 w-4" />
                          <span>GitHub Profile</span>
                        </Link>
                      )}
                      {developer.linkedin && (
                        <Link
                          href={developer.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-primary transition-colors nav-item-hover"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn Profile</span>
                        </Link>
                      )}
                      {developer.website && (
                        <Link
                          href={developer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-primary transition-colors nav-item-hover"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Personal Website</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Contact Developer
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
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{developer.bio}</p>
                    </CardContent>
                  </Card>

                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Assessment Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">
                            {developer.assessments.filter((a) => a.status === "completed").length}
                          </div>
                          <div className="text-xs text-muted-foreground">Assessments Completed</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">
                            {developer.assessments.length > 0
                              ? Math.round(
                                  developer.assessments.reduce((sum, a) => sum + (a.score || 0), 0) /
                                    developer.assessments.length,
                                )
                              : 0}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">Average Score</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">
                            {developer.assessments.length > 0
                              ? Math.round(
                                  (developer.assessments.reduce((sum, a) => sum + (a.timeSpent / a.maxTime) * 100, 0) /
                                    developer.assessments.length) *
                                    100,
                                ) / 100
                              : 0}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">Avg. Time Efficiency</div>
                        </div>
                      </div>

                      {developer.assessments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Recent Assessment</h3>
                          <div className="border rounded-md p-4 hover-subtle">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{developer.assessments[0].title}</h4>
                                <div className="text-sm text-muted-foreground">
                                  Completed on {formatDate(developer.assessments[0].completedAt)}
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Score:</span>
                                <span className="font-medium">{developer.assessments[0].score}%</span>
                              </div>
                              <Progress value={developer.assessments[0].score} className="h-2" />
                              <div className="flex justify-between text-sm">
                                <span>Time spent:</span>
                                <span>
                                  {developer.assessments[0].timeSpent} / {developer.assessments[0].maxTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Top Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {developer.skills.slice(0, 6).map((skill, index) => (
                          <SkillBadge key={index} skill={skill.name} level={skill.level} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 animate-fade-in">
                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Technical Skills</CardTitle>
                      <CardDescription>Developer's technical expertise and proficiency levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {developer.skills.map((skill, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span>{skill.name}</span>
                            </div>
                            <SkillBadge skill="" level={skill.level} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>Notable projects the developer has worked on</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {developer.projects.map((project, index) => (
                          <div key={index} className="border rounded-lg p-4 hover-subtle">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{project.name}</h3>
                                <p className="text-sm mt-1">{project.description}</p>
                              </div>
                              <Link
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                <Code className="h-4 w-4" />
                              </Link>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="outline" className="bg-primary/5">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6 animate-fade-in">
                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Work Experience</CardTitle>
                      <CardDescription>Professional background and career history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {developer.experiences.map((exp, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4 relative hover-subtle">
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

                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {developer.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4 relative hover-subtle">
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

                <TabsContent value="assessments" className="space-y-6 animate-fade-in">
                  <Card className="hover-profile">
                    <CardHeader>
                      <CardTitle>Assessment History</CardTitle>
                      <CardDescription>Technical assessments completed by the developer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {developer.assessments.length > 0 ? (
                        <div className="space-y-4">
                          {developer.assessments.map((assessment, index) => (
                            <div key={index} className="border rounded-lg p-4 hover-subtle">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{assessment.title}</h3>
                                  <div className="text-sm text-muted-foreground">
                                    {assessment.completedAt
                                      ? `Completed on ${formatDate(assessment.completedAt)}`
                                      : "Not completed"}
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Completed</Badge>
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
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

