import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Button  } from '@/components/ui-daisy/button'
import { ArrowRight, Briefcase, FileText, User } from "lucide-react"
import Link from "next/link"

export default async function DeveloperDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Your Profile</CardTitle>
            </div>
            <CardDescription>Complete your profile to increase your visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Profile Completion</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
                <div className="h-2 w-24 rounded-full bg-muted">
                  <div className="h-full w-3/4 rounded-full bg-primary"></div>
                </div>
              </div>
              <Link href="/developer/profile">
                <Button className="w-full gap-1">
                  Complete Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Your Applications</CardTitle>
            </div>
            <CardDescription>Track your job applications and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Applications</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <Link href="/developer/applications">
                <Button className="w-full gap-1">
                  View Applications
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Available Roles</CardTitle>
            </div>
            <CardDescription>Find your next opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Matching Roles</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
              </div>
              <Link href="/developer/roles">
                <Button className="w-full gap-1">
                  Browse Roles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions with the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">Senior Frontend Developer at TechCorp</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Assessment Completed</p>
                    <p className="text-sm text-muted-foreground">React & TypeScript Challenge</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Profile Updated</p>
                    <p className="text-sm text-muted-foreground">Added new skills and projects</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

