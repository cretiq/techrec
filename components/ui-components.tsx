"use client"

import type React from "react"
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Progress } from "@/components/ui-daisy/progress"
import {  Button  } from '@/components/ui-daisy/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui-daisy/avatar"
import {
  Code,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Star,
  BarChart3,
  User,
  Calendar,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ===== CARDS =====

interface AssessmentCardProps {
  id?: string
  title: string
  company: string
  difficulty: string
  duration: number
  skills: string[]
  deadline?: string
  status?: "active" | "draft" | "completed" | "expired"
  onClick?: () => void
}

export function AssessmentCard({
  id,
  title,
  company,
  difficulty,
  duration,
  skills,
  deadline,
  status = "active",
  onClick,
}: AssessmentCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-800",
  }

  return (
    <Card className="overflow-hidden hover-subtle">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{company}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{difficulty}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
        </div>
        {deadline && (
          <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{deadline}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClick || (() => (window.location.href = `/company/assessments/${id}`))}
          className="w-full gap-1"
        >
          View Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface CandidateCardProps {
  id: string
  name: string
  email: string
  assessment: string
  score: number
  status: "matched" | "reviewing" | "pending" | "rejected"
  matchPercentage?: number
  avatarUrl?: string
  onClick?: () => void
}

export function CandidateCard({
  id,
  name,
  email,
  assessment,
  score,
  status,
  matchPercentage,
  avatarUrl,
  onClick,
}: CandidateCardProps) {
  const statusColors = {
    matched: "bg-green-100 text-green-800",
    reviewing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
  }

  const statusIcons = {
    matched: <CheckCircle2 className="h-4 w-4" />,
    reviewing: <Clock3 className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  }

  return (
    <Card className="hover-subtle">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/company/developers/${id}`} className="hover:text-primary hover:underline">
                <CardTitle className="text-lg">{name}</CardTitle>
              </Link>
              <CardDescription>{email}</CardDescription>
            </div>
          </div>
          <Badge className={statusColors[status]}>
            <div className="flex items-center gap-1">
              {statusIcons[status]}
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Assessment:</span>
            <span className="font-medium">{assessment}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Score:</span>
            <div className="flex items-center gap-2">
              <Progress value={score} className="w-[100px] h-2" />
              <span className="font-medium">{score}%</span>
            </div>
          </div>
          {matchPercentage && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Match:</span>
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {matchPercentage}% Match
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClick || (() => (window.location.href = `/company/developers/${id}`))}
          variant="outline"
          className="w-full"
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  }

  return (
    <Card className="hover-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className={`text-xs ${trend ? trendColors[trend] : ""}`}>{change}</p>}
      </CardContent>
    </Card>
  )
}

interface ResultCardProps {
  title: string
  score: number
  maxScore: number
  passThreshold: number
  details: {
    category: string
    score: number
    maxScore: number
  }[]
}

export function ResultCard({ title, score, maxScore, passThreshold, details }: ResultCardProps) {
  const percentage = Math.round((score / maxScore) * 100)
  const passed = percentage >= passThreshold

  return (
    <Card className="hover-subtle">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Assessment Results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-bold flex items-center gap-2">
            {passed ? <CheckCircle className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
            {percentage}%
          </div>
          <Progress
            value={percentage}
            className="w-full h-2"
            indicatorClassName={passed ? "bg-green-500" : "bg-red-500"}
          />
          <div className="text-sm text-muted-foreground">
            Score: {score}/{maxScore} points (Pass threshold: {passThreshold}%)
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Breakdown</h4>
          {details.map((detail, index) => {
            const detailPercentage = Math.round((detail.score / detail.maxScore) * 100)
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{detail.category}</span>
                  <span className="font-medium">
                    {detail.score}/{detail.maxScore}
                  </span>
                </div>
                <Progress value={detailPercentage} className="h-1" />
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Download Report</Button>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  )
}

// ===== TABS =====

interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface CustomTabsProps {
  defaultValue: string
  items: TabItem[]
  children: React.ReactNode
  variant?: "default" | "underline" | "pills"
}

export function CustomTabs({ defaultValue, items, children, variant = "default" }: CustomTabsProps) {
  const tabsListClass = {
    default: "",
    underline: "border-b",
    pills: "bg-muted p-1 rounded-lg",
  }

  const tabsTriggerClass = {
    default: "",
    underline: "border-b-2 border-transparent data-[state=active]:border-primary rounded-none",
    pills: "rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm",
  }

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList className={`w-full ${tabsListClass[variant]}`}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={`flex items-center gap-2 ${tabsTriggerClass[variant]}`}
          >
            {item.icon && item.icon}
            {item.label}
            {item.count !== undefined && (
              <Badge variant="secondary" className="ml-1 h-5 px-2">
                {item.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}

// ===== BADGES =====

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "pending"
  text: string
  icon?: boolean
}

export function StatusBadge({ status, text, icon = true }: StatusBadgeProps) {
  const statusStyles = {
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    error: "bg-red-100 text-red-800 hover:bg-red-200",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    pending: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  const statusIcons = {
    success: <CheckCircle className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
    info: <FileText className="h-3 w-3" />,
    pending: <Clock className="h-3 w-3" />,
  }

  return (
    <Badge className={`${statusStyles[status]} flex items-center gap-1`}>
      {icon && statusIcons[status]}
      {text}
    </Badge>
  )
}

interface SkillBadgeProps {
  skill: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  className?: string
}

export function SkillBadge({ skill, level, className }: SkillBadgeProps) {
  const levelColors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-green-100 text-green-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      levelColors[level],
      className
    )}>
      {skill}
    </div>
  )
}

interface ScoreBadgeProps {
  score: number
  maxScore?: number
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function ScoreBadge({ score, maxScore = 100, showIcon = true, size = "md" }: ScoreBadgeProps) {
  const percentage = Math.round((score / maxScore) * 100)

  let color = "bg-red-100 text-red-800"
  if (percentage >= 80) color = "bg-green-100 text-green-800"
  else if (percentage >= 60) color = "bg-blue-100 text-blue-800"
  else if (percentage >= 40) color = "bg-yellow-100 text-yellow-800"

  const sizeClasses = {
    sm: "text-xs py-0 px-2",
    md: "text-sm py-0.5 px-2.5",
    lg: "text-base py-1 px-3",
  }

  return (
    <Badge className={`${color} ${sizeClasses[size]} font-medium`}>
      {showIcon && <Star className="h-3 w-3 mr-1" />}
      {maxScore ? `${score}/${maxScore}` : `${percentage}%`}
    </Badge>
  )
}

interface DifficultyBadgeProps {
  level: "beginner" | "intermediate" | "advanced" | "expert"
}

export function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const levelConfig = {
    beginner: {
      color: "bg-green-100 text-green-800",
      icon: <GraduationCap className="h-3 w-3" />,
    },
    intermediate: {
      color: "bg-blue-100 text-blue-800",
      icon: <Code className="h-3 w-3" />,
    },
    advanced: {
      color: "bg-purple-100 text-purple-800",
      icon: <Briefcase className="h-3 w-3" />,
    },
    expert: {
      color: "bg-red-100 text-red-800",
      icon: <Award className="h-3 w-3" />,
    },
  }

  return (
    <Badge className={`${levelConfig[level].color} flex items-center gap-1`}>
      {levelConfig[level].icon}
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  )
}

// Component Showcase
export function ComponentShowcase() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssessmentCard
            title="Senior Frontend Developer"
            company="TechCorp Inc."
            difficulty="Advanced"
            duration={90}
            skills={["React", "TypeScript", "CSS"]}
            deadline="Expires in 3 days"
            status="active"
          />

          <CandidateCard
            id="some-candidate-id"
            name="Alex Johnson"
            email="alex@example.com"
            assessment="Frontend Developer"
            score={92}
            status="matched"
            matchPercentage={95}
          />

          <ResultCard
            title="JavaScript Assessment"
            score={85}
            maxScore={100}
            passThreshold={70}
            details={[
              { category: "Fundamentals", score: 45, maxScore: 50 },
              { category: "Advanced Concepts", score: 25, maxScore: 30 },
              { category: "Problem Solving", score: 15, maxScore: 20 },
            ]}
          />

          <StatCard
            title="Active Assessments"
            value={12}
            change="+2 from last month"
            icon={<FileText className="h-4 w-4" />}
            trend="up"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Tabs</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Default Tabs</h3>
            <CustomTabs
              defaultValue="assessments"
              items={[
                { value: "assessments", label: "Assessments", icon: <FileText className="h-4 w-4" />, count: 12 },
                { value: "candidates", label: "Candidates", icon: <User className="h-4 w-4" />, count: 24 },
                { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              ]}
            >
              <TabsContent value="assessments" className="p-4 border rounded-md mt-2">
                Assessments content would go here
              </TabsContent>
              <TabsContent value="candidates" className="p-4 border rounded-md mt-2">
                Candidates content would go here
              </TabsContent>
              <TabsContent value="analytics" className="p-4 border rounded-md mt-2">
                Analytics content would go here
              </TabsContent>
            </CustomTabs>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Underline Tabs</h3>
            <CustomTabs
              defaultValue="active"
              variant="underline"
              items={[
                { value: "active", label: "Active", count: 5 },
                { value: "completed", label: "Completed", count: 12 },
                { value: "draft", label: "Draft", count: 3 },
              ]}
            >
              <TabsContent value="active" className="p-4 mt-2">
                Active content would go here
              </TabsContent>
              <TabsContent value="completed" className="p-4 mt-2">
                Completed content would go here
              </TabsContent>
              <TabsContent value="draft" className="p-4 mt-2">
                Draft content would go here
              </TabsContent>
            </CustomTabs>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Pills Tabs</h3>
            <CustomTabs
              defaultValue="all"
              variant="pills"
              items={[
                { value: "all", label: "All Tests" },
                { value: "coding", label: "Coding" },
                { value: "multiple-choice", label: "Multiple Choice" },
                { value: "project", label: "Project" },
              ]}
            >
              <TabsContent value="all" className="p-4 mt-2">
                All tests content would go here
              </TabsContent>
              <TabsContent value="coding" className="p-4 mt-2">
                Coding tests content would go here
              </TabsContent>
              <TabsContent value="multiple-choice" className="p-4 mt-2">
                Multiple choice tests content would go here
              </TabsContent>
              <TabsContent value="project" className="p-4 mt-2">
                Project tests content would go here
              </TabsContent>
            </CustomTabs>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Badges</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" text="Completed" />
              <StatusBadge status="warning" text="Expiring Soon" />
              <StatusBadge status="error" text="Failed" />
              <StatusBadge status="info" text="In Review" />
              <StatusBadge status="pending" text="Pending" />
              <StatusBadge status="success" text="Passed" icon={false} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Skill Badges</h3>
            <div className="flex flex-wrap gap-3">
              <SkillBadge skill="JavaScript" level="intermediate" />
              <SkillBadge skill="React" level="intermediate" />
              <SkillBadge skill="TypeScript" level="advanced" />
              <SkillBadge skill="CSS" level="beginner" />
              <SkillBadge skill="Node.js" level="expert" />
              <SkillBadge skill="Python" level="intermediate" />
              <SkillBadge skill="Java" level="expert" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Score Badges</h3>
            <div className="flex flex-wrap gap-3">
              <ScoreBadge score={95} />
              <ScoreBadge score={75} />
              <ScoreBadge score={45} />
              <ScoreBadge score={25} />
              <ScoreBadge score={18} maxScore={20} />
              <ScoreBadge score={42} maxScore={50} showIcon={false} />
              <ScoreBadge score={85} size="sm" />
              <ScoreBadge score={65} size="lg" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Difficulty Badges</h3>
            <div className="flex flex-wrap gap-3">
              <DifficultyBadge level="beginner" />
              <DifficultyBadge level="intermediate" />
              <DifficultyBadge level="advanced" />
              <DifficultyBadge level="expert" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

