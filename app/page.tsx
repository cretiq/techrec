import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Code,
  Shield,
  BarChart3,
  Users,
  FileText,
  Layout,
  FormInput,
  Layers,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Revolutionize Your Technical Hiring
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Customizable assessments, secure testing environments, and AI-powered candidate matching in one
                  platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/dashboard">
                  <Button size="lg" className="gap-1">
                    For Companies
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/developer/dashboard">
                  <Button size="lg" variant="outline" className="gap-1">
                    For Developers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Customizable Assessments</h3>
                <p className="text-muted-foreground">
                  Tailor technical tests to match specific role requirements and skill levels.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure Testing Environment</h3>
                <p className="text-muted-foreground">
                  Locked-down browser environment with advanced plagiarism detection.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-time Analytics</h3>
                <p className="text-muted-foreground">Immediate feedback and comprehensive performance metrics.</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Automated Matching</h3>
                <p className="text-muted-foreground">
                  AI-powered system connects qualified candidates with the right companies.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Platform Navigation</h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Explore the different sections of our technical assessment platform.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <CardTitle>Company Dashboard</CardTitle>
                  </div>
                  <CardDescription>Manage assessments and review candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access your company dashboard to create assessments, review candidate submissions, and track hiring
                    metrics.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/company/dashboard" className="w-full">
                    <Button className="w-full gap-1">
                      Go to Company Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle>Developer Dashboard</CardTitle>
                  </div>
                  <CardDescription>Take assessments and track progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access your developer dashboard to take technical assessments, view results, and connect with
                    potential employers.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/developer/dashboard" className="w-full">
                    <Button className="w-full gap-1">
                      Go to Developer Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Assessment Creation</CardTitle>
                  </div>
                  <CardDescription>Create custom technical assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Build customized technical assessments with coding challenges, multiple-choice questions, and
                    project tasks.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/company/assessments/new" className="w-full">
                    <Button className="w-full gap-1">
                      Create Assessment
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <CardTitle>Code Editor</CardTitle>
                  </div>
                  <CardDescription>Interactive coding environment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Experience our powerful code editor with syntax highlighting, test execution, and real-time
                    feedback.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/developer/assessment/demo" className="w-full">
                    <Button className="w-full gap-1">
                      Try Code Editor
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FormInput className="h-5 w-5 text-primary" />
                    <CardTitle>Form Components</CardTitle>
                  </div>
                  <CardDescription>Explore form UI components</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View our collection of form components including inputs, selects, textareas, and more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/form-components" className="w-full">
                    <Button className="w-full gap-1">
                      View Form Components
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    <CardTitle>UI Components</CardTitle>
                  </div>
                  <CardDescription>Explore UI component library</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse our comprehensive UI component library including cards, tabs, badges, and more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/component-showcase" className="w-full">
                    <Button className="w-full gap-1">
                      View UI Components
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <CardTitle>All Components</CardTitle>
                  </div>
                  <CardDescription>View all platform components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/ui-components">
                      <Button variant="outline" className="w-full">
                        Base UI Components
                      </Button>
                    </Link>
                    <Link href="/component-showcase">
                      <Button variant="outline" className="w-full">
                        Component Showcase
                      </Button>
                    </Link>
                    <Link href="/form-components">
                      <Button variant="outline" className="w-full">
                        Form Components
                      </Button>
                    </Link>
                    <Link href="/button-showcase">
                      <Button variant="outline" className="w-full">
                        Button Components
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>User Dashboards</CardTitle>
                  </div>
                  <CardDescription>Access user-specific dashboards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Link href="/company/dashboard">
                      <Button variant="outline" className="w-full gap-1">
                        <Briefcase className="h-4 w-4" />
                        Company Dashboard
                      </Button>
                    </Link>
                    <Link href="/developer/dashboard">
                      <Button variant="outline" className="w-full gap-1">
                        <GraduationCap className="h-4 w-4" />
                        Developer Dashboard
                      </Button>
                    </Link>
                    <Link href="/company/assessments/create">
                      <Button variant="outline" className="w-full gap-1">
                        <FileText className="h-4 w-4" />
                        Create Assessment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 DevAssess. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

